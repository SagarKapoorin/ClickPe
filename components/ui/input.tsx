import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input(props: InputProps) {
  const { className, type = "text", ...rest } = props;

  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-full border border-zinc-300 bg-transparent px-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus-visible:border-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:border-zinc-700 dark:focus-visible:border-zinc-100 dark:focus-visible:ring-zinc-100/10",
        className
      )}
      {...rest}
    />
  );
}

