import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "fantasy" | "compact"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "fantasy", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex w-full bg-[var(--bg-dark)] text-[var(--text-primary)]",
          "border border-[var(--border-solid)]",
          "placeholder:text-[var(--text-dim)]",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:border-[var(--accent-glow)]",
          "focus-visible:shadow-[0_0_8px_var(--border-glow)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",

          // Number input spinner removal
          type === "number" && [
            "[appearance:textfield]",
            "[&::-webkit-outer-spin-button]:appearance-none",
            "[&::-webkit-inner-spin-button]:appearance-none",
          ].join(" "),

          // Variant styles
          variant === "fantasy" && [
            "h-10 px-3 py-2 text-sm",
            "[clip-path:var(--clip-chamfer-sm)]",
          ].join(" "),

          variant === "default" && "h-9 px-3 py-1 text-sm rounded-md",

          variant === "compact" && "h-8 px-2 py-1 text-xs rounded-sm",

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
