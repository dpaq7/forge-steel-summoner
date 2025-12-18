import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  variant?: "default" | "fantasy"
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 6, variant = "fantasy", ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        // Base styles
        "z-[9999] overflow-hidden px-3 py-2 text-sm",
        "bg-[var(--bg-card)] text-[var(--text-primary)]",
        "border border-[var(--accent-dim)]",
        "shadow-[0_4px_12px_rgba(0,0,0,0.4),0_0_0_1px_var(--accent-dim)]",

        // Animation
        "animate-in fade-in-0 zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=top]:slide-in-from-bottom-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",

        // Variant styles - chamfered corners for fantasy
        variant === "fantasy" && "[clip-path:polygon(6px_0,calc(100%-6px)_0,100%_6px,100%_calc(100%-6px),calc(100%-6px)_100%,6px_100%,0_calc(100%-6px),0_6px)]",
        variant === "default" && "rounded-md",

        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
