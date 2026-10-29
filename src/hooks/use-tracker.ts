import { useCallback, useEffect, useState } from "react"
import { parseUploadCsv, type UploadRecord } from "@/lib/records"

const RECORDS_KEY = "upload-tracker:records"
const DONE_KEY = "upload-tracker:done"

/** id del registro -> momento (epoch ms) en que se marcó como subido. */
type DoneMap = Record<string, number>

export interface Notice {
  kind: "ok" | "error"
  text: string
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Almacenamiento lleno o bloqueado: la app sigue funcionando sin persistir.
  }
}

/** WinSCP/PowerShell suelen guardar en UTF-8, pero si el CSV viene en ANSI caemos a windows-1252. */
async function readText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer)
  } catch {
    return new TextDecoder("windows-1252").decode(buffer)
  }
}

export function useTracker() {
  const [records, setRecords] = useState<UploadRecord[]>(() =>
    load<UploadRecord[]>(RECORDS_KEY, [])
  )
  const [done, setDone] = useState<DoneMap>(() => load<DoneMap>(DONE_KEY, {}))
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => save(RECORDS_KEY, records), [records])
  useEffect(() => save(DONE_KEY, done), [done])

  const importFiles = useCallback(
    async (files: File[]) => {
      let added = 0
      let duplicates = 0
      let skipped = 0
      const known = new Set(records.map((r) => r.id))
      const incoming: UploadRecord[] = []

      try {
        for (const file of files) {
          const result = parseUploadCsv(await readText(file))
          skipped += result.skipped
          for (const record of result.records) {
            if (known.has(record.id)) {
              duplicates++
            } else {
              known.add(record.id)
              incoming.push(record)
              added++
            }
          }
        }
      } catch (error) {
        setNotice({
          kind: "error",
          text: error instanceof Error ? error.message : "No se pudo leer el CSV.",
        })
        return
      }

      if (incoming.length > 0) setRecords((prev) => [...prev, ...incoming])

      const parts = [`${added} registros nuevos`]
      if (duplicates > 0) parts.push(`${duplicates} ya existían`)
      if (skipped > 0) parts.push(`${skipped} filas ignoradas`)
      setNotice({ kind: "ok", text: parts.join(" · ") })
    },
    [records]
  )

  const setMany = useCallback((ids: string[], value: boolean) => {
    setDone((prev) => {
      const next = { ...prev }
      const now = Date.now()
      for (const id of ids) {
        if (value) next[id] = prev[id] ?? now
        else delete next[id]
      }
      return next
    })
  }, [])

  const toggle = useCallback(
    (id: string) => setMany([id], !done[id]),
    [done, setMany]
  )

  const clearAll = useCallback(() => {
    setRecords([])
    setDone({})
    setNotice(null)
  }, [])

  const dismissNotice = useCallback(() => setNotice(null), [])

  return {
    records,
    done,
    notice,
    importFiles,
    toggle,
    setMany,
    clearAll,
    dismissNotice,
  }
}
