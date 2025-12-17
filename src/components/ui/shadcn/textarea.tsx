import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "fantasy"
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "fantasy", ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Base styles
          "flex min-h-[120px] w-full resize-y",
          "bg-[var(--bg-dark)] text-[var(--text-primary)]",
          "border border-[var(--border-solid)]",
          "px-3 py-2 text-sm",
          "placeholder:text-[var(--text-dim)]",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:border-[var(--accent-glow)]",
          "focus-visible:shadow-[0_0_8px_var(--border-glow)]",
          "disabled:cursor-not-allowed disabled:opacity-50",

          // Variant styles
          variant === "fantasy" && "[clip-path:var(--clip-chamfer-md)]",
          variant === "default" && "rounded-md",

          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
