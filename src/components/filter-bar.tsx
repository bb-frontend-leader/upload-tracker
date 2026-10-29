import { FilterXIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ALL,
  DEFAULT_FILTERS,
  hasActiveFilters,
  type Filters,
  type OutcomeFilter,
  type StatusFilter,
} from "@/lib/filters"

interface FilterBarProps {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  servers: string[]
  extensions: string[]
  hasFailures: boolean
  shown: number
  total: number
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-xs font-bold tracking-widest uppercase">
        {label}
      </span>
      {children}
    </div>
  )
}

function OptionSelect({
  value,
  onChange,
  allLabel,
  options,
  className,
}: {
  value: string
  onChange: (value: string) => void
  allLabel: string
  options: { value: string; label: string }[]
  className?: string
}) {
  const items = [{ value: ALL, label: allLabel }, ...options]
  return (
    <Select
      value={value}
      items={items}
      onValueChange={(next) => onChange(next ?? ALL)}
    >
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="min-w-48">
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function FilterBar({
  filters,
  onChange,
  servers,
  extensions,
  hasFailures,
  shown,
  total,
}: FilterBarProps) {
  return (
    <section
      aria-label="Filtros"
      className="space-y-4 border-2 border-foreground bg-card p-4 shadow-brutal"
    >
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <Field label="Buscar">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={filters.query}
              onChange={(e) => onChange({ query: e.target.value })}
              placeholder="nombre de archivo o ruta…"
              className="pl-9"
            />
          </div>
        </Field>

        <Field label="Estado">
          <ToggleGroup
            value={[filters.status]}
            onValueChange={(next) => {
              if (next[0]) onChange({ status: next[0] as StatusFilter })
            }}
          >
            <ToggleGroupItem value="all">Todos</ToggleGroupItem>
            <ToggleGroupItem value="pending">Pendientes</ToggleGroupItem>
            <ToggleGroupItem value="done">Subidos</ToggleGroupItem>
          </ToggleGroup>
        </Field>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <Field label="Desde (fecha del fallo / backup)">
          <Input
            type="datetime-local"
            value={filters.since}
            onChange={(e) => onChange({ since: e.target.value })}
            className="w-56"
          />
        </Field>

        {servers.length > 1 && (
          <Field label="Servidor">
            <OptionSelect
              value={filters.server}
              onChange={(server) => onChange({ server })}
              allLabel="Todos"
              options={servers.map((s) => ({ value: s, label: s }))}
              className="w-44"
            />
          </Field>
        )}

        <Field label="Tipo">
          <OptionSelect
            value={filters.ext}
            onChange={(ext) => onChange({ ext })}
            allLabel="Todos"
            options={extensions.map((e) => ({ value: e, label: e ? `.${e}` : "(sin extensión)" }))}
            className="w-36"
          />
        </Field>

        {hasFailures && (
          <Field label="Resultado">
            <OptionSelect
              value={filters.outcome}
              onChange={(outcome) => onChange({ outcome: outcome as OutcomeFilter })}
              allLabel="Todos"
              options={[
                { value: "ok", label: "Exitosos" },
                { value: "failed", label: "Fallidos" },
              ]}
              className="w-36"
            />
          </Field>
        )}

        <Field label="Versiones">
          <Toggle
            variant="outline"
            pressed={filters.latestOnly}
            onPressedChange={(latestOnly) => onChange({ latestOnly })}
            title="Si un archivo se subió varias veces, muestra solo la subida más reciente"
          >
            Solo la última de cada archivo
          </Toggle>
        </Field>

        <div className="ml-auto flex items-center gap-4">
          <p className="font-mono text-sm">
            <strong>{shown}</strong> de {total}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasActiveFilters(filters)}
            onClick={() => onChange({ ...DEFAULT_FILTERS, newestFirst: filters.newestFirst })}
          >
            <FilterXIcon /> Limpiar
          </Button>
        </div>
      </div>
    </section>
  )
}
