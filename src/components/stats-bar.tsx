import { cn } from "@/lib/utils"
import { formatSize } from "@/lib/records"

interface StatsBarProps {
  total: number
  done: number
  pendingKb: number
  failed: number
}

function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string
  value: string
  hint?: string
  className?: string
}) {
  return (
    <div className={cn("border-2 border-foreground p-4 shadow-brutal", className)}>
      <p className="font-mono text-xs font-bold tracking-widest uppercase">
        {label}
      </p>
      <p className="mt-1 text-4xl leading-none font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-2 font-mono text-xs">{hint}</p>}
    </div>
  )
}

export function StatsBar({ total, done, pendingKb, failed }: StatsBarProps) {
  const pending = total - done
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <section aria-label="Resumen" className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Registros" value={String(total)} className="bg-card" />
        <Stat
          label="Pendientes"
          value={String(pending)}
          hint={failed > 0 ? `${failed} fallaron en origen` : undefined}
          className="bg-secondary"
        />
        <Stat label="Subidos" value={String(done)} className="bg-success" />
        <Stat
          label="Peso pendiente"
          value={formatSize(pendingKb)}
          className="bg-card"
        />
      </div>

      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso de resubida"
        className="relative h-9 border-2 border-foreground bg-card shadow-brutal"
      >
        <div
          className="h-full border-r-2 border-foreground bg-success transition-[width] duration-300"
          style={{ width: `${percent}%`, borderRightWidth: percent === 0 || percent === 100 ? 0 : 2 }}
        />
        <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold">
          {percent}% COMPLETADO
        </span>
      </div>
    </section>
  )
}
