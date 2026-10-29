import { DownloadIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** El .exe vive en `public/download/`, que Vite sirve desde la raíz del sitio. */
export const CONVERTER_URL = `${import.meta.env.BASE_URL}download/BitacoraWinSCP.exe`
export const CONVERTER_FILE = "BitacoraWinSCP.exe"

export function ConverterDownload({ className }: { className?: string }) {
  return (
    <a
      href={CONVERTER_URL}
      download={CONVERTER_FILE}
      className={cn(buttonVariants({ variant: "secondary" }), className)}
    >
      <DownloadIcon /> Descargar conversor
    </a>
  )
}

const STEPS = [
  <>
    Activa el registro XML en WinSCP (<strong>Preferencias → Logging</strong>) o
    inicia WinSCP con <code>/xmllog=C:\ruta\sesion.xml</code>. Cada archivo que
    subas quedará anotado en ese XML.
  </>,
  <>
    Descarga y abre <code>{CONVERTER_FILE}</code> y selecciona el XML de WinSCP.
    Genera un CSV con las columnas <code>Fecha, Servidor, ArchivoLocal,
    RutaRemota, TamanoKB, Exitoso</code>.
  </>,
  <>
    Carga ese CSV aquí con <strong>Cargar CSV</strong> o arrastrándolo a la
    página.
  </>,
]

export function ConverterHelp() {
  return (
    <section
      aria-label="Cómo generar el CSV"
      className="grid gap-6 border-2 border-foreground bg-card p-5 shadow-brutal md:grid-cols-[1fr_auto]"
    >
      <div>
        <h2 className="text-2xl font-bold uppercase">¿Cómo genero el CSV?</h2>
        <p className="mt-1 text-sm">
          WinSCP guarda su bitácora en XML. El conversor lo pasa a CSV para que
          esta página lo pueda leer.
        </p>
        <ol className="mt-4 space-y-3">
          {STEPS.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center border-2 border-foreground bg-primary font-mono text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="pt-0.5 text-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex items-start">
        <ConverterDownload className="h-12 px-6 text-base" />
      </div>
    </section>
  )
}
