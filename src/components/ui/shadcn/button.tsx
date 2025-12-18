import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "focus-visible:ring-[var(--accent-glow)] focus-visible:ring-offset-[var(--bg-darkest)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        // === STANDARD VARIANTS ===
        default: [
          "bg-[var(--accent-primary)] text-[var(--bg-darkest)]",
          "hover:bg-[var(--accent-bright)]",
          "shadow-sm",
        ].join(" "),

        destructive: [
          "bg-[var(--color-danger)] text-white",
          "hover:bg-[var(--color-danger)]/90",
          "shadow-sm",
        ].join(" "),

        outline: [
          "border border-[var(--border-solid)] bg-transparent",
          "text-[var(--text-primary)]",
          "hover:bg-[var(--accent-dim)] hover:text-[var(--accent-bright)]",
        ].join(" "),

        secondary: [
          "bg-[var(--bg-medium)] text-[var(--text-primary)]",
          "hover:bg-[var(--bg-dark)]",
        ].join(" "),

        ghost: [
          "text-[var(--text-secondary)]",
          "hover:bg-[var(--accent-dim)] hover:text-[var(--accent-bright)]",
        ].join(" "),

        link: [
          "text-[var(--accent-primary)] underline-offset-4",
          "hover:underline",
        ].join(" "),

        // === FANTASY VARIANTS ===
        chamfered: [
          "bg-[var(--bg-dark)]",
          "text-[var(--text-primary)]",
          "font-[var(--font-display)] uppercase tracking-wider text-sm",
          "[clip-path:var(--clip-chamfer-sm)]",
          // Use inset box-shadow instead of border - it follows the clip-path shape
          "shadow-[inset_0_0_0_1px_var(--border-solid)]",
          "hover:bg-[var(--accent-dim)]",
          "hover:shadow-[inset_0_0_0_1px_var(--accent-primary),0_0_12px_var(--border-glow)]",
        ].join(" "),

        combat: [
          "bg-gradient-to-b from-[var(--color-danger)] to-[#8b0000]",
          "text-white font-[var(--font-display)] uppercase tracking-wider",
          "[clip-path:var(--clip-arrow-right)]",
          "shadow-[0_0_15px_var(--color-danger-dim)]",
          "hover:brightness-110 hover:shadow-[0_0_25px_var(--color-danger)]",
          "animate-[combat-pulse_2s_ease-in-out_infinite]",
        ].join(" "),

        heroic: [
          "bg-gradient-to-b from-[var(--accent-primary)] to-[var(--accent-dim)]",
          "text-[var(--bg-darkest)] font-[var(--font-display)] font-bold uppercase tracking-wider",
          "[clip-path:var(--clip-shield)]",
          "hover:brightness-115 hover:shadow-[0_0_20px_var(--accent-glow)]",
        ].join(" "),

        success: [
          "bg-[var(--color-success)] text-[var(--bg-darkest)]",
          "font-[var(--font-display)] uppercase tracking-wider",
          "[clip-path:var(--clip-chamfer-sm)]",
          "shadow-[0_0_12px_var(--color-success-dim)]",
          "hover:brightness-110 hover:shadow-[0_0_18px_var(--color-success)]",
          "animate-[success-pulse_1.5s_ease-in-out_infinite]",
        ].join(" "),

        warning: [
          "bg-[var(--color-warning)] text-black",
          "font-[var(--font-display)] uppercase tracking-wider",
          "[clip-path:var(--clip-chamfer-sm)]",
          "hover:brightness-110",
        ].join(" "),

        diamond: [
          "bg-[var(--bg-card)] border-2 border-[var(--border-solid)]",
          "[clip-path:var(--clip-diamond)]",
          "hover:border-[var(--accent-primary)] hover:bg-[var(--accent-dim)]",
          "p-0 aspect-square",
        ].join(" "),

        hexagon: [
          "bg-[var(--bg-card)] border-2 border-[var(--border-solid)]",
          "[clip-path:var(--clip-hexagon)]",
          "hover:border-[var(--accent-primary)] hover:bg-[var(--accent-dim)]",
          "hover:shadow-[0_0_12px_var(--border-glow)]",
        ].join(" "),
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        sm: "h-8 px-3 py-1.5 text-xs",
        lg: "h-11 px-6 py-2.5 text-base",
        xl: "h-12 px-8 py-3 text-lg",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-7 w-7 p-0",
        "icon-lg": "h-11 w-11 p-0",
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
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
