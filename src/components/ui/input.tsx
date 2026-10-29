import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 border-2 border-foreground bg-card px-3 py-1 font-mono text-sm shadow-brutal-sm transition-shadow outline-none placeholder:text-muted-foreground focus-visible:bg-accent/40 focus-visible:shadow-brutal disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
