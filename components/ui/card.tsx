import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
        className
      )}
      {...rest}
    />
  );
}

export function CardHeader(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn("mb-3 flex flex-col gap-1", className)}
      {...rest}
    />
  );
}

export function CardTitle(props: HTMLAttributes<HTMLHeadingElement>) {
  const { className, ...rest } = props;
  return (
    <h3
      className={cn("text-base font-semibold leading-tight", className)}
      {...rest}
    />
  );
}

export function CardDescription(props: HTMLAttributes<HTMLParagraphElement>) {
  const { className, ...rest } = props;
  return (
    <p
      className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)}
      {...rest}
    />
  );
}

export function CardContent(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn("mb-3 flex flex-col gap-2 text-sm", className)}
      {...rest}
    />
  );
}

export function CardFooter(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn("mt-auto flex items-center justify-between gap-2", className)}
      {...rest}
    />
  );
}

