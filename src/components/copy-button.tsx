import { useEffect, useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CopyButtonProps {
  value: string
  label: string
}

export function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Sin permiso de portapapeles (contexto no seguro): no hay nada útil que hacer.
    }
  }

  return (
    <Button
      variant="outline"
      size="icon-xs"
      onClick={copy}
      aria-label={label}
      title={label}
      className={copied ? "bg-success" : undefined}
    >
      {copied ? <CheckIcon strokeWidth={3} /> : <CopyIcon />}
    </Button>
  )
}
