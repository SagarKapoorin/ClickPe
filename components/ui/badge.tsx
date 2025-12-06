import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "outline" | "success";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge(props: BadgeProps) {
  const { className, variant = "default", ...rest } = props;

  const variants: Record<BadgeVariant, string> = {
    default:
      "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900",
    outline:
      "border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200",
    success:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...rest}
    />
  );
}

