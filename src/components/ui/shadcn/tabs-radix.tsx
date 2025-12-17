import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const RadixTabs = TabsPrimitive.Root

export interface RadixTabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: "default" | "fantasy" | "pills"
}

const RadixTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  RadixTabsListProps
>(({ className, variant = "fantasy", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-0.5 p-1",
      "bg-[var(--bg-darkest)] border border-[var(--border-solid)]",

      variant === "fantasy" && "[clip-path:var(--clip-chamfer-md)]",
      variant === "default" && "rounded-lg",
      variant === "pills" && "rounded-full bg-transparent border-none gap-2 p-0",

      className
    )}
    {...props}
  />
))
RadixTabsList.displayName = TabsPrimitive.List.displayName

export interface RadixTabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  variant?: "default" | "fantasy"
}

const RadixTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  RadixTabsTriggerProps
>(({ className, variant = "fantasy", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styles
      "inline-flex items-center justify-center whitespace-nowrap",
      "px-4 py-2 text-sm font-medium",
      "text-[var(--text-muted)]",
      "transition-all duration-150",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-[var(--accent-glow)] focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",

      // Fantasy variant
      variant === "fantasy" && [
        "font-[var(--font-display)] uppercase tracking-[0.1em] text-xs",
        "[clip-path:var(--clip-chamfer-sm)]",
        "hover:text-[var(--text-primary)] hover:bg-[var(--bg-medium)]",
        "data-[state=active]:bg-[var(--accent-dim)]",
        "data-[state=active]:text-[var(--accent-bright)]",
        "data-[state=active]:shadow-[0_0_10px_var(--border-glow)]",
      ].join(" "),

      // Default variant
      variant === "default" && [
        "rounded-md",
        "hover:bg-[var(--bg-medium)]",
        "data-[state=active]:bg-[var(--bg-card)]",
        "data-[state=active]:text-[var(--text-primary)]",
        "data-[state=active]:shadow-sm",
      ].join(" "),

      className
    )}
    {...props}
  />
))
RadixTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const RadixTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-none",
      "data-[state=inactive]:hidden",
      // Animation
      "data-[state=active]:animate-in",
      "data-[state=active]:fade-in-0",
      "data-[state=active]:slide-in-from-bottom-1",
      "duration-200",
      className
    )}
    {...props}
  />
))
RadixTabsContent.displayName = TabsPrimitive.Content.displayName

export { RadixTabs, RadixTabsList, RadixTabsTrigger, RadixTabsContent }
