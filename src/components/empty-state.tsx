import { FileSpreadsheetIcon, UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onPick: () => void
}

const STEPS = [
  "Carga la bitácora CSV que genera WinSCP.",
  "Revisa qué se subió, cuándo y a dónde, ya ordenado por día.",
  "Marca cada archivo conforme lo vuelves a subir al servidor restaurado.",
]

export function EmptyState({ onPick }: EmptyStateProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <button
        type="button"
        onClick={onPick}
        className="group flex min-h-80 cursor-pointer flex-col items-center justify-center gap-5 border-2 border-dashed border-foreground bg-card p-8 text-center shadow-brutal transition-all outline-none hover:bg-accent focus-visible:ring-4 focus-visible:ring-foreground/30"
      >
        <span className="flex size-20 items-center justify-center border-2 border-foreground bg-secondary shadow-brutal transition-transform group-hover:-rotate-6 group-hover:bg-card">
          <FileSpreadsheetIcon className="size-10" strokeWidth={2.5} />
        </span>
        <span>
          <span className="block text-3xl font-bold uppercase">
            Arrastra tu CSV aquí
          </span>
          <span className="mt-2 block font-mono text-sm">
            o haz clic para elegir el archivo
          </span>
        </span>
        <span className="font-mono text-xs">
          Todo se procesa en tu navegador. Nada se envía a ningún servidor.
        </span>
      </button>

      <div className="flex flex-col justify-between gap-6 border-2 border-foreground bg-primary p-6 text-primary-foreground shadow-brutal">
        <div>
          <h2 className="text-2xl font-bold uppercase">¿Cómo funciona?</h2>
          <ol className="mt-4 space-y-4">
            {STEPS.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center border-2 border-primary-foreground font-mono font-bold">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <Button variant="secondary" size="lg" onClick={onPick} className="border-primary-foreground shadow-[4px_4px_0_0_var(--primary-foreground)]">
          <UploadIcon /> Cargar CSV
        </Button>
      </div>
    </section>
  )
}
