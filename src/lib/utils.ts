import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge class names with Tailwind CSS conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fantasy variant types for themed components
 */
export type FantasyVariant =
  | "default"
  | "chamfered"
  | "diamond"
  | "hexagon"
  | "combat"
  | "heroic"
  | "scroll"
  | "compact";

/**
 * Size variants
 */
export type SizeVariant = "sm" | "md" | "lg" | "xl";
