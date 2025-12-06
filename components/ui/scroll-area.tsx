import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ScrollAreaProps = HTMLAttributes<HTMLDivElement>;

export function ScrollArea(props: ScrollAreaProps) {
  const { className, ...rest } = props;

  return (
    <div
      className={cn("relative overflow-y-auto", className)}
      {...rest}
    />
  );
}

