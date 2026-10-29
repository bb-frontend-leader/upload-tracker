import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center border-2 border-foreground text-sm font-bold tracking-wide whitespace-nowrap uppercase shadow-brutal transition-all outline-none select-none hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_0_var(--foreground)] focus-visible:ring-4 focus-visible:ring-foreground/30 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "bg-card text-foreground hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground",
        ghost:
          "border-transparent bg-transparent shadow-none hover:translate-x-0 hover:translate-y-0 hover:border-foreground hover:bg-accent hover:shadow-none active:translate-x-0 active:translate-y-0",
        destructive: "bg-destructive text-foreground",
        link: "border-transparent bg-transparent shadow-none underline underline-offset-4 hover:translate-x-0 hover:translate-y-0 hover:shadow-none active:translate-x-0 active:translate-y-0",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs: "h-6 gap-1 px-2 text-xs shadow-brutal-sm [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 text-xs shadow-brutal-sm",
        lg: "h-12 gap-2 px-6 text-base",
        icon: "size-10",
        "icon-xs": "size-6 shadow-brutal-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 shadow-brutal-sm",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
