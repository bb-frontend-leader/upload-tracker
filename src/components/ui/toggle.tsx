import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const toggleVariants = cva(
  "group/toggle inline-flex cursor-pointer items-center justify-center gap-1.5 text-sm font-bold tracking-wide whitespace-nowrap uppercase transition-colors outline-none hover:bg-accent focus-visible:ring-4 focus-visible:ring-foreground/30 disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-primary aria-pressed:text-primary-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card",
        outline: "border-2 border-foreground bg-card shadow-brutal-sm",
      },
      size: {
        default: "h-10 min-w-10 px-3",
        sm: "h-8 min-w-8 px-2.5 text-xs",
        lg: "h-12 min-w-12 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
