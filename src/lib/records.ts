import { parseCsv, toCsv } from "@/lib/csv"

export interface UploadRecord {
  /** Hash estable de fecha + servidor + rutas; sirve para recordar qué registros se marcaron. */
  id: string
  /** Epoch ms (hora local del CSV). */
  timestamp: number
  server: string
  localPath: string
  remotePath: string
  /** Directorio remoto sin el nombre del archivo. */
  remoteDir: string
  fileName: string
  /** Extensión en minúsculas, sin punto. Vacía si no tiene. */
  ext: string
  sizeKb: number
  success: boolean
}

const REQUIRED_COLUMNS = [
  "fecha",
  "servidor",
  "archivolocal",
  "rutaremota",
  "tamanokb",
  "exitoso",
] as const

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()

/** FNV-1a de 32 bits. Suficiente para identificar filas, no es criptográfico. */
function hash(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

function parseDate(value: string): number {
  const m = value
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (!m) return NaN
  const [, y, mo, d, h, mi, s] = m
  return new Date(+y, +mo - 1, +d, +h, +mi, s ? +s : 0).getTime()
}

/** Acepta `23,5`, `1.234,5` y `23.5`. Un único punto seguido de 3 dígitos se toma como miles. */
function parseNumber(value: string): number {
  let v = value.trim().replace(/\s/g, "")
  if (v.includes(",")) {
    v = v.replaceAll(".", "").replace(",", ".")
  } else if (/^\d{1,3}(\.\d{3})+$/.test(v)) {
    v = v.replaceAll(".", "")
  }
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function parseBool(value: string): boolean {
  return ["si", "sí", "true", "1", "yes", "ok", "x"].includes(normalize(value))
}

function splitPath(path: string): { dir: string; name: string } {
  const i = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"))
  return i === -1
    ? { dir: "", name: path }
    : { dir: path.slice(0, i), name: path.slice(i + 1) }
}

export interface ParseResult {
  records: UploadRecord[]
  skipped: number
}

export function parseUploadCsv(text: string): ParseResult {
  const rows = parseCsv(text)
  if (rows.length === 0) throw new Error("El archivo está vacío.")

  const header = rows[0].map(normalize)
  const col = Object.fromEntries(
    REQUIRED_COLUMNS.map((name) => [name, header.indexOf(name)])
  ) as Record<(typeof REQUIRED_COLUMNS)[number], number>

  const missing = REQUIRED_COLUMNS.filter((name) => col[name] === -1)
  if (missing.length > 0) {
    throw new Error(
      `No parece una bitácora de WinSCP. Faltan las columnas: ${missing.join(", ")}.`
    )
  }

  const records: UploadRecord[] = []
  let skipped = 0

  for (const row of rows.slice(1)) {
    const fecha = row[col.fecha]?.trim() ?? ""
    const timestamp = parseDate(fecha)
    const remotePath = row[col.rutaremota]?.trim() ?? ""
    const localPath = row[col.archivolocal]?.trim() ?? ""

    if (Number.isNaN(timestamp) || (!remotePath && !localPath)) {
      skipped++
      continue
    }

    const server = row[col.servidor]?.trim() ?? ""
    const { dir, name } = splitPath(remotePath || localPath)
    const dot = name.lastIndexOf(".")

    records.push({
      id: hash(`${fecha}|${server}|${localPath}|${remotePath}`),
      timestamp,
      server,
      localPath,
      remotePath,
      remoteDir: dir,
      fileName: name,
      ext: dot > 0 ? name.slice(dot + 1).toLowerCase() : "",
      sizeKb: parseNumber(row[col.tamanokb] ?? ""),
      success: parseBool(row[col.exitoso] ?? ""),
    })
  }

  return { records, skipped }
}

/** Directorio remoto compartido por todos los registros (por segmentos completos). */
export function commonRemoteRoot(records: UploadRecord[]): string {
  const dirs = [...new Set(records.map((r) => r.remoteDir))]
  if (dirs.length < 2) return ""
  const split = dirs.map((d) => d.split("/"))
  const first = split[0]
  let n = first.length
  for (const parts of split.slice(1)) {
    let i = 0
    while (i < n && i < parts.length && parts[i] === first[i]) i++
    n = i
  }
  return first.slice(0, n).join("/")
}

export function formatSize(kb: number): string {
  const fmt = (n: number, max: number) =>
    n.toLocaleString("es", { maximumFractionDigits: max })
  if (kb >= 1024 * 1024) return `${fmt(kb / 1024 / 1024, 2)} GB`
  if (kb >= 1024) return `${fmt(kb / 1024, 2)} MB`
  return `${fmt(kb, 1)} KB`
}

const dayFmt = new Intl.DateTimeFormat("es", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
})
const timeFmt = new Intl.DateTimeFormat("es", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})
const shortDayFmt = new Intl.DateTimeFormat("es", {
  day: "2-digit",
  month: "short",
})

export const formatDay = (ts: number) => dayFmt.format(ts)
export const formatShortDay = (ts: number) => shortDayFmt.format(ts)
export const formatTime = (ts: number) => timeFmt.format(ts)

/** Clave `YYYY-MM-DD` en hora local, para agrupar por día. */
export function dayKey(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Valor para `<input type="datetime-local">`. */
export function toDatetimeLocal(ts: number): string {
  return `${dayKey(ts)}T${new Intl.DateTimeFormat("sv", { hour: "2-digit", minute: "2-digit", hour12: false }).format(ts)}`
}

/** Conserva solo la subida más reciente de cada ruta remota. */
export function latestPerRemotePath(records: UploadRecord[]): UploadRecord[] {
  const latest = new Map<string, UploadRecord>()
  for (const r of records) {
    const key = `${r.server}|${r.remotePath || r.localPath}`
    const prev = latest.get(key)
    if (!prev || r.timestamp > prev.timestamp) latest.set(key, r)
  }
  return [...latest.values()]
}

export function exportPendingCsv(records: UploadRecord[]): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return toCsv([
    ["Fecha", "Servidor", "ArchivoLocal", "RutaRemota", "TamanoKB", "Exitoso"],
    ...records.map((r) => {
      const d = new Date(r.timestamp)
      return [
        `${dayKey(r.timestamp)} ${pad(d.getHours())}:${pad(d.getMinutes())}`,
        r.server,
        r.localPath,
        r.remotePath,
        String(r.sizeKb).replace(".", ","),
        r.success ? "Sí" : "No",
      ]
    }),
  ])
}
