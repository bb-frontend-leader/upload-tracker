import { latestPerRemotePath, type UploadRecord } from "@/lib/records"

export type StatusFilter = "all" | "pending" | "done"
export type OutcomeFilter = "all" | "ok" | "failed"

export interface Filters {
  query: string
  server: string
  ext: string
  status: StatusFilter
  outcome: OutcomeFilter
  /** Valor de `datetime-local`; vacío = sin límite. */
  since: string
  latestOnly: boolean
  newestFirst: boolean
}

export const ALL = "all"

export const DEFAULT_FILTERS: Filters = {
  query: "",
  server: ALL,
  ext: ALL,
  status: "all",
  outcome: ALL,
  since: "",
  latestOnly: false,
  newestFirst: true,
}

/**
 * Registros que entran en el "trabajo" actual: el rango de fechas y la opción de
 * quedarse con la última versión de cada archivo. Las estadísticas se calculan sobre esto.
 */
export function scopeRecords(
  records: UploadRecord[],
  filters: Pick<Filters, "since" | "latestOnly">
): UploadRecord[] {
  const since = filters.since ? new Date(filters.since).getTime() : -Infinity
  const inRange = records.filter((r) => r.timestamp >= since)
  return filters.latestOnly ? latestPerRemotePath(inRange) : inRange
}

export function applyFilters(
  scope: UploadRecord[],
  filters: Filters,
  done: Record<string, number>
): UploadRecord[] {
  const query = filters.query.trim().toLowerCase()

  const matches = scope.filter((r) => {
    if (filters.server !== ALL && r.server !== filters.server) return false
    if (filters.ext !== ALL && r.ext !== filters.ext) return false
    if (filters.outcome === "ok" && !r.success) return false
    if (filters.outcome === "failed" && r.success) return false
    if (filters.status === "pending" && done[r.id]) return false
    if (filters.status === "done" && !done[r.id]) return false
    if (
      query &&
      !`${r.fileName} ${r.remotePath} ${r.localPath}`.toLowerCase().includes(query)
    ) {
      return false
    }
    return true
  })

  const dir = filters.newestFirst ? -1 : 1
  return matches.sort((a, b) => dir * (a.timestamp - b.timestamp))
}

export function hasActiveFilters(filters: Filters): boolean {
  return (Object.keys(DEFAULT_FILTERS) as (keyof Filters)[]).some(
    (key) => key !== "newestFirst" && filters[key] !== DEFAULT_FILTERS[key]
  )
}
