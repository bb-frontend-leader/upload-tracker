"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cn } from "cn"
import { CheckIcon, MinusIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-7 shrink-0 cursor-pointer items-center justify-center border-2 border-foreground bg-card shadow-brutal-sm transition-all outline-none hover:bg-accent focus-visible:ring-4 focus-visible:ring-foreground/30 active:translate-x-px active:translate-y-px active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-success data-indeterminate:bg-accent",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-foreground"
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>
            {state.indeterminate ? (
              <MinusIcon className="size-5" strokeWidth={4} />
            ) : (
              <CheckIcon className="size-5" strokeWidth={4} />
            )}
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
