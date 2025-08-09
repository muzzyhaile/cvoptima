import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-4 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 uppercase tracking-wide shadow-brutal border-4 border-white",
  {
    variants: {
      variant: {
        default: "bg-yellow-400 text-black font-black hover:bg-yellow-300 hover:shadow-brutal-hover hover:translate-x-[-4px] hover:translate-y-[-4px] border-black",
        destructive:
          "bg-red-600 text-white font-black border-white hover:bg-red-500 hover:shadow-brutal-hover hover:translate-x-[-4px] hover:translate-y-[-4px]",
        outline:
          "border-4 border-white bg-transparent text-white hover:bg-yellow-400 hover:text-black font-black hover:shadow-brutal-hover hover:translate-x-[-4px] hover:translate-y-[-4px]",
        secondary:
          "bg-gray-200 text-black font-black border-black hover:bg-gray-100 hover:shadow-brutal-hover hover:translate-x-[-4px] hover:translate-y-[-4px]",
        ghost: "border-transparent text-white hover:bg-red-600 hover:text-white font-black hover:border-white",
        link: "text-yellow-400 underline-offset-4 hover:underline font-black border-transparent hover:text-yellow-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
