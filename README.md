# Upload Tracker

Visor de la bitácora que genera WinSCP al subir archivos a un servidor. Cuando el servidor falla
y se restaura un backup, sirve para recordar qué se subió en ese tiempo: muestra los registros en
una tabla legible (agrupados por día, con la ruta remota simplificada) y permite marcar cuáles ya
volviste a subir.

Todo corre en el navegador: el CSV nunca sale de tu equipo. El progreso (registros cargados y
marcas) se guarda en `localStorage`, así que sobrevive a recargar la página.

## Stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI) con estilo brutalista.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + build de producción en dist/
npm run lint
```

## Flujo de uso

WinSCP registra las subidas en XML y esta página lee CSV, así que el flujo completo es:

1. **Registrar:** activa el log XML en WinSCP (*Preferencias → Logging*) o inicia WinSCP con
   `/xmllog=C:\ruta\sesion.xml`.
2. **Convertir:** abre `BitacoraWinSCP.exe` (botón **Descargar conversor** en la página),
   selecciona el XML y genera el CSV.
3. **Cargar:** arrastra el CSV a la página o usa **Cargar CSV**. Cargar el mismo registro dos
   veces no lo duplica.
4. **Filtrar:** usa **Desde** para quedarte solo con lo subido después del último backup bueno.
   **Solo la última de cada archivo** oculta versiones viejas: si `index.html` se subió 5 veces,
   solo importa la última.
5. **Marcar:** marca cada archivo conforme lo vuelves a subir. **Marcar día** y el checkbox de la
   cabecera marcan en bloque lo que estás viendo.
6. **Exportar:** **Exportar pendientes** descarga un CSV con lo que falta, en el mismo formato.

### El ejecutable

La página sirve el conversor desde `public/download/BitacoraWinSCP.exe` (URL
`/download/BitacoraWinSCP.exe`). El binario no es parte del código fuente: hay que copiarlo a esa
carpeta antes de compilar o desplegar. Sin el archivo, el botón de descarga no funciona.

## Formato del CSV

Separado por `;` (también acepta `,`), con BOM UTF-8 y tamaños con coma decimal. Columnas
requeridas:

```
Fecha;Servidor;ArchivoLocal;RutaRemota;TamanoKB;Exitoso
2026-10-28 17:03;BOOKS&BOOKS;C:\...\logo.svg;/media/.../logo.svg;23,5;Sí
```

Un registro se identifica por un hash de fecha + servidor + ruta local + ruta remota; es lo que
permite recordar las marcas entre cargas.

## Estructura

```
public/download/          ejecutable BitacoraWinSCP.exe (se sirve tal cual)
src/lib/csv.ts            parser/serializador CSV
src/lib/records.ts        modelo, parseo de la bitácora y formateo
src/lib/filters.ts        filtros y ordenamiento
src/hooks/use-tracker.ts  estado + persistencia en localStorage
src/components/           tabla, filtros, estadísticas, ayuda del conversor
src/components/ui/        componentes shadcn (restilizados a brutalismo)
```

## Repositorio

<https://github.com/bb-frontend-leader/upload-tracker>
