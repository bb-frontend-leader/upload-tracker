/** Quita el BOM UTF-8 que deja WinSCP / PowerShell al inicio del archivo. */
function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

/** Elige `;` o `,` según cuál aparece más en la cabecera. */
function detectDelimiter(text: string): string {
  const header = text.split(/\r?\n/, 1)[0] ?? ""
  const semicolons = header.split(";").length
  const commas = header.split(",").length
  return semicolons >= commas ? ";" : ","
}

/** Parser CSV mínimo (RFC 4180) con soporte de comillas y saltos de línea dentro de celdas. */
export function parseCsv(input: string): string[][] {
  const text = stripBom(input)
  const delimiter = detectDelimiter(text)
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          quoted = false
        }
      } else {
        cell += char
      }
      continue
    }

    if (char === '"') {
      quoted = true
    } else if (char === delimiter) {
      row.push(cell)
      cell = ""
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
    } else {
      cell += char
    }
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ""))
}

function escapeCell(value: string, delimiter: string): string {
  return value.includes(delimiter) || /["\r\n]/.test(value)
    ? `"${value.replaceAll('"', '""')}"`
    : value
}

/** Serializa filas con el mismo formato que genera WinSCP (`;` + BOM) para que Excel lo abra bien. */
export function toCsv(rows: string[][], delimiter = ";"): string {
  const body = rows
    .map((r) => r.map((c) => escapeCell(c, delimiter)).join(delimiter))
    .join("\r\n")
  return `﻿${body}\r\n`
}
