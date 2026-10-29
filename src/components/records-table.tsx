import { Fragment, useMemo } from "react"
import { ArrowDownIcon, ArrowUpIcon, CornerDownRightIcon } from "lucide-react"
import { CopyButton } from "@/components/copy-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  dayKey,
  formatDay,
  formatSize,
  formatTime,
  type UploadRecord,
} from "@/lib/records"
import { cn } from "@/lib/utils"

interface RecordsTableProps {
  records: UploadRecord[]
  done: Record<string, number>
  /** Directorio remoto común que se omite en cada fila. */
  remoteRoot: string
  newestFirst: boolean
  onToggleOrder: () => void
  onToggle: (id: string) => void
  onSetMany: (ids: string[], value: boolean) => void
}

interface DayGroup {
  key: string
  timestamp: number
  records: UploadRecord[]
}

function groupByDay(records: UploadRecord[]): DayGroup[] {
  const groups: DayGroup[] = []
  for (const record of records) {
    const key = dayKey(record.timestamp)
    const last = groups.at(-1)
    if (last?.key === key) last.records.push(record)
    else groups.push({ key, timestamp: record.timestamp, records: [record] })
  }
  return groups
}

function relativeDir(dir: string, root: string): string {
  if (!root) return dir
  if (dir === root) return "(raíz)"
  return dir.startsWith(`${root}/`) ? dir.slice(root.length + 1) : dir
}

export function RecordsTable({
  records,
  done,
  remoteRoot,
  newestFirst,
  onToggleOrder,
  onToggle,
  onSetMany,
}: RecordsTableProps) {
  const groups = useMemo(() => groupByDay(records), [records])
  const doneCount = records.filter((r) => done[r.id]).length
  const allDone = records.length > 0 && doneCount === records.length
  const someDone = doneCount > 0 && !allDone
  const OrderIcon = newestFirst ? ArrowDownIcon : ArrowUpIcon

  return (
    <div className="border-2 border-foreground bg-card shadow-brutal">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-primary">
            <TableHead className="w-14">
              <Checkbox
                checked={allDone}
                indeterminate={someDone}
                onCheckedChange={(checked) =>
                  onSetMany(
                    records.map((r) => r.id),
                    checked
                  )
                }
                aria-label="Marcar o desmarcar todos los visibles"
                className="border-primary-foreground"
              />
            </TableHead>
            <TableHead className="w-24">
              <button
                type="button"
                onClick={onToggleOrder}
                className="inline-flex cursor-pointer items-center gap-1 uppercase hover:underline"
                aria-label={newestFirst ? "Ordenado de más reciente a más antiguo" : "Ordenado de más antiguo a más reciente"}
              >
                Hora <OrderIcon className="size-3.5" strokeWidth={3} />
              </button>
            </TableHead>
            <TableHead>Archivo</TableHead>
            <TableHead className="hidden lg:table-cell">Servidor</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Tamaño</TableHead>
            <TableHead className="w-36">Estado</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {groups.map((group) => {
            const groupIds = group.records.map((r) => r.id)
            const groupDone = group.records.filter((r) => done[r.id]).length
            const groupAllDone = groupDone === group.records.length

            return (
              <Fragment key={group.key}>
                <TableRow className="bg-secondary hover:bg-secondary">
                  <TableCell colSpan={6} className="py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold tracking-wide uppercase">
                        {formatDay(group.timestamp)}
                      </span>
                      <span className="flex items-center gap-3 font-mono text-xs font-bold">
                        {groupDone}/{group.records.length} subidos
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => onSetMany(groupIds, !groupAllDone)}
                        >
                          {groupAllDone ? "Desmarcar día" : "Marcar día"}
                        </Button>
                      </span>
                    </div>
                  </TableCell>
                </TableRow>

                {group.records.map((record) => {
                  const isDone = Boolean(done[record.id])
                  return (
                    <TableRow
                      key={record.id}
                      className={cn(isDone && "bg-success/25 hover:bg-success/35")}
                    >
                      <TableCell className="w-14">
                        <Checkbox
                          checked={isDone}
                          onCheckedChange={() => onToggle(record.id)}
                          aria-label={`Marcar ${record.fileName} como subido`}
                        />
                      </TableCell>

                      <TableCell className="font-mono text-base font-bold tabular-nums">
                        {formatTime(record.timestamp)}
                      </TableCell>

                      <TableCell className="max-w-0 min-w-64 sm:max-w-xl">
                        <div className="flex flex-wrap items-center gap-2">
                          {record.ext && (
                            <Badge variant="default">.{record.ext}</Badge>
                          )}
                          <span
                            title={record.localPath}
                            className={cn(
                              "text-base font-bold break-all",
                              isDone && "line-through decoration-2"
                            )}
                          >
                            {record.fileName}
                          </span>
                          {!record.success && (
                            <Badge variant="destructive">Falló</Badge>
                          )}
                        </div>
                        <div className="mt-1.5 flex items-start gap-2">
                          <CornerDownRightIcon className="mt-0.5 size-3.5 shrink-0" />
                          <span
                            title={record.remotePath}
                            className="font-mono text-xs break-all text-muted-foreground"
                          >
                            {relativeDir(record.remoteDir, remoteRoot)}
                          </span>
                          <CopyButton
                            value={record.remotePath}
                            label="Copiar ruta remota completa"
                          />
                        </div>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline">{record.server || "—"}</Badge>
                      </TableCell>

                      <TableCell className="hidden text-right font-mono text-sm whitespace-nowrap tabular-nums sm:table-cell">
                        {formatSize(record.sizeKb)}
                      </TableCell>

                      <TableCell>
                        {isDone ? (
                          <Badge variant="success">Subido</Badge>
                        ) : (
                          <Badge variant="secondary">Pendiente</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </Fragment>
            )
          })}

          {records.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="py-16 text-center">
                <p className="text-2xl font-bold uppercase">Nada que mostrar</p>
                <p className="mt-1 font-mono text-sm">
                  Ningún registro coincide con los filtros actuales.
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
