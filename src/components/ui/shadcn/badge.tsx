import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center font-semibold transition-colors",
  {
    variants: {
      variant: {
        // Standard variants
        default: "bg-[var(--accent-primary)] text-[var(--bg-darkest)]",
        secondary: "bg-[var(--bg-medium)] text-[var(--text-secondary)]",
        destructive: "bg-[var(--color-danger)] text-white",
        outline: "border border-[var(--border-solid)] text-[var(--text-secondary)] bg-transparent",

        // Fantasy variants
        keyword: [
          "bg-[var(--bg-darkest)] border border-[var(--border-solid)]",
          "text-[var(--text-muted)] uppercase tracking-wider",
          "[clip-path:var(--clip-chamfer-sm)]",
        ].join(" "),

        diamond: [
          "bg-[var(--bg-dark)] border border-[var(--border-solid)]",
          "text-[var(--text-secondary)] uppercase tracking-wider",
          "[clip-path:polygon(8px_0%,calc(100%-8px)_0%,100%_50%,calc(100%-8px)_100%,8px_100%,0%_50%)]",
        ].join(" "),

        // Tier badges
        tier1: "bg-[var(--color-danger)] text-white font-bold",
        tier2: "bg-[var(--color-warning)] text-black font-bold",
        tier3: "bg-[var(--color-success)] text-black font-bold",

        // Damage type badges
        fire: "bg-[#ff4444] text-white",
        cold: "bg-[#4488ff] text-white",
        lightning: "bg-[#ffdd44] text-black",
        poison: "bg-[#44aa44] text-white",
        psychic: "bg-[#aa44aa] text-white",
        corruption: "bg-[#660066] text-white",
        holy: "bg-[#ffffaa] text-black",
        sonic: "bg-[#88aaff] text-black",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[0.65rem]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
