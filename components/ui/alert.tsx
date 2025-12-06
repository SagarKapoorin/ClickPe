import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "default" | "destructive";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

export function Alert(props: AlertProps) {
  const { className, variant = "default", ...rest } = props;

  const base = "rounded-lg border p-3 text-sm";
  const variants: Record<AlertVariant, string> = {
    default:
      "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
    destructive:
      "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-50",
  };

  return (
    <div
      className={cn(base, variants[variant], className)}
      {...rest}
    />
  );
}

