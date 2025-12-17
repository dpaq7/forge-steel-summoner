// Re-export all shadcn components

// Motion components (from MCP)
export * from './motion-highlight';
export * from './tabs';
export * from './spinner';

// Radix-based components
export { Button, buttonVariants, type ButtonProps } from './button';
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  type DialogContentProps,
} from './dialog';
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  type AlertDialogContentProps,
} from './alert-dialog';
export { Input, type InputProps } from './input';
export { Textarea, type TextareaProps } from './textarea';
export { Label } from './label';
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  type SelectTriggerProps,
  type SelectContentProps,
} from './select';
export {
  RadixTabs,
  RadixTabsList,
  RadixTabsTrigger,
  RadixTabsContent,
  type RadixTabsListProps,
  type RadixTabsTriggerProps,
} from './tabs-radix';
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  type TooltipContentProps,
} from './tooltip';
export { Badge, badgeVariants, type BadgeProps } from './badge';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  type DropdownMenuContentProps,
} from './dropdown-menu';
export { ScrollArea, ScrollBar } from './scroll-area';
export { Separator } from './separator';
