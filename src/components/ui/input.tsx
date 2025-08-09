import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full border-4 border-white bg-input px-4 py-3 text-base font-mono font-bold text-white ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-bold file:text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-4 disabled:cursor-not-allowed disabled:opacity-50 uppercase",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
