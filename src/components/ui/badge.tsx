import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border-2 px-3 py-1 text-xs font-black focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-2 uppercase tracking-wide shadow-brutal",
  {
    variants: {
      variant: {
        default:
          "border-border bg-primary text-black",
        secondary:
          "border-border bg-secondary text-black",
        destructive:
          "border-border bg-destructive text-white",
        outline: "text-white border-border bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
