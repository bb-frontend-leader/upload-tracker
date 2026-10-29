import { useEffect, useMemo, useRef, useState } from "react"
import { CircleHelpIcon, DownloadIcon, Trash2Icon, UploadIcon, XIcon } from "lucide-react"
import { ConverterDownload, ConverterHelp } from "@/components/converter-help"
import { EmptyState } from "@/components/empty-state"
import { FilterBar } from "@/components/filter-bar"
import { RecordsTable } from "@/components/records-table"
import { StatsBar } from "@/components/stats-bar"
import { Button } from "@/components/ui/button"
import { useTracker } from "@/hooks/use-tracker"
import {
  applyFilters,
  DEFAULT_FILTERS,
  scopeRecords,
  type Filters,
} from "@/lib/filters"
import { commonRemoteRoot, exportPendingCsv } from "@/lib/records"
import { cn } from "@/lib/utils"

function download(filename: string, content: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8" })
  )
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const { records, done, notice, importFiles, toggle, setMany, clearAll, dismissNotice } =
    useTracker()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [dragging, setDragging] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const hasData = records.length > 0
  const [helpOpen, setHelpOpen] = useState(!hasData)
  const inputRef = useRef<HTMLInputElement>(null)

  // La ayuda se abre sola cuando no hay datos y se cierra en cuanto se carga un CSV.
  useEffect(() => setHelpOpen(!hasData), [hasData])

  const patchFilters = (patch: Partial<Filters>) =>
    setFilters((prev) => ({ ...prev, ...patch }))

  // Los avisos de éxito se esconden solos; los errores esperan a que el usuario los cierre.
  useEffect(() => {
    if (notice?.kind !== "ok") return
    const timer = setTimeout(dismissNotice, 6000)
    return () => clearTimeout(timer)
  }, [notice, dismissNotice])

  useEffect(() => {
    if (!confirmClear) return
    const timer = setTimeout(() => setConfirmClear(false), 4000)
    return () => clearTimeout(timer)
  }, [confirmClear])

  const remoteRoot = useMemo(() => commonRemoteRoot(records), [records])
  const servers = useMemo(
    () => [...new Set(records.map((r) => r.server))].filter(Boolean).sort(),
    [records]
  )
  const extensions = useMemo(
    () => [...new Set(records.map((r) => r.ext))].sort(),
    [records]
  )
  const hasFailures = useMemo(() => records.some((r) => !r.success), [records])

  const { since, latestOnly } = filters
  const scope = useMemo(
    () => scopeRecords(records, { since, latestOnly }),
    [records, since, latestOnly]
  )
  const visible = useMemo(
    () => applyFilters(scope, filters, done),
    [scope, filters, done]
  )

  const stats = useMemo(() => {
    let doneCount = 0
    let pendingKb = 0
    let failed = 0
    for (const r of scope) {
      if (done[r.id]) {
        doneCount++
      } else {
        pendingKb += r.sizeKb
        if (!r.success) failed++
      }
    }
    return { doneCount, pendingKb, failed }
  }, [scope, done])

  function openPicker() {
    inputRef.current?.click()
  }

  function handleFiles(list: FileList | null) {
    const files = Array.from(list ?? []).filter((f) => /\.(csv|txt)$/i.test(f.name))
    if (files.length > 0) void importFiles(files)
    if (inputRef.current) inputRef.current.value = ""
  }

  function exportPending() {
    const pending = visible.filter((r) => !done[r.id])
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")
    download(`pendientes_${stamp}.csv`, exportPendingCsv(pending))
  }

  const pendingVisible = visible.filter((r) => !done[r.id]).length

  return (
    <div
      className="min-h-screen"
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt,text/csv"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-secondary/90">
          <p className="border-4 border-dashed border-foreground bg-card p-10 text-4xl font-bold uppercase shadow-brutal-lg">
            Suelta el CSV
          </p>
        </div>
      )}

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex flex-wrap items-end justify-between gap-6 border-2 border-foreground bg-card p-5 shadow-brutal-lg sm:p-6">
          <div>
            <p className="inline-block border-2 border-foreground bg-secondary px-2 font-mono text-xs font-bold tracking-widest uppercase">
              WinSCP · bitácora de subidas
            </p>
            <h1 className="mt-3 text-4xl leading-none font-bold tracking-tighter uppercase sm:text-6xl">
              Upload<span className="bg-primary px-1 text-primary-foreground">/</span>Tracker
            </h1>
            <p className="mt-3 max-w-xl text-base">
              Lo que subiste al servidor, legible. Marca lo que ya volviste a
              subir después de una restauración.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ConverterDownload />
            <Button
              variant="outline"
              aria-expanded={helpOpen}
              onClick={() => setHelpOpen((open) => !open)}
            >
              <CircleHelpIcon /> Ayuda
            </Button>
            <Button onClick={openPicker}>
              <UploadIcon /> {records.length > 0 ? "Agregar CSV" : "Cargar CSV"}
            </Button>
            {records.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={exportPending}
                  disabled={pendingVisible === 0}
                >
                  <DownloadIcon /> Exportar pendientes ({pendingVisible})
                </Button>
                <Button
                  variant={confirmClear ? "destructive" : "outline"}
                  onClick={() => {
                    if (confirmClear) {
                      clearAll()
                      setFilters(DEFAULT_FILTERS)
                      setConfirmClear(false)
                    } else {
                      setConfirmClear(true)
                    }
                  }}
                >
                  <Trash2Icon /> {confirmClear ? "¿Seguro? Borra todo" : "Borrar todo"}
                </Button>
              </>
            )}
          </div>
        </header>

        {notice && (
          <div
            role={notice.kind === "error" ? "alert" : "status"}
            className={cn(
              "flex items-start justify-between gap-4 border-2 border-foreground p-4 font-mono text-sm font-bold shadow-brutal",
              notice.kind === "error" ? "bg-destructive" : "bg-success"
            )}
          >
            <span>{notice.text}</span>
            <button
              type="button"
              onClick={dismissNotice}
              aria-label="Cerrar aviso"
              className="cursor-pointer"
            >
              <XIcon className="size-5" strokeWidth={3} />
            </button>
          </div>
        )}

        {helpOpen && <ConverterHelp />}

        {records.length === 0 ? (
          <EmptyState onPick={openPicker} />
        ) : (
          <>
            <StatsBar
              total={scope.length}
              done={stats.doneCount}
              pendingKb={stats.pendingKb}
              failed={stats.failed}
            />

            <FilterBar
              filters={filters}
              onChange={patchFilters}
              servers={servers}
              extensions={extensions}
              hasFailures={hasFailures}
              shown={visible.length}
              total={scope.length}
            />

            {remoteRoot && (
              <p className="border-2 border-foreground bg-muted p-3 font-mono text-xs break-all">
                <strong className="uppercase">Raíz remota:</strong> {remoteRoot}{" "}
                <span className="text-muted-foreground">
                  (se omite en las rutas de la tabla; el botón de copiar trae la ruta completa)
                </span>
              </p>
            )}

            <RecordsTable
              records={visible}
              done={done}
              remoteRoot={remoteRoot}
              newestFirst={filters.newestFirst}
              onToggleOrder={() => patchFilters({ newestFirst: !filters.newestFirst })}
              onToggle={toggle}
              onSetMany={setMany}
            />
          </>
        )}
      </main>
    </div>
  )
}
