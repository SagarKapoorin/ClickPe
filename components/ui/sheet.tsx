import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type SheetContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SheetContext = createContext<SheetContextValue | null>(null);

type SheetProps = {
  children: ReactNode;
};

export function Sheet(props: SheetProps) {
  const { children } = props;
  const [open, setOpen] = useState(false);
  const value = useMemo<SheetContextValue>(
    () => ({ open, setOpen }),
    [open]
  );

  return (
    <SheetContext.Provider value={value}>{children}</SheetContext.Provider>
  );
}

type SheetTriggerProps = {
  children: ReactNode;
};

export function SheetTrigger(props: SheetTriggerProps) {
  const { children } = props;
  const context = useContext(SheetContext);

  if (!context) {
    return children;
  }

  const handleClick = () => {
    context.setOpen(true);
  };

  return (
    <span onClick={handleClick}>{children}</span>
  );
}

type SheetContentProps = {
  children: ReactNode;
};

export function SheetContent(props: SheetContentProps) {
  const { children } = props;
  const context = useContext(SheetContext);

  if (!context || !context.open) {
    return null;
  }

  const handleClose = () => {
    context.setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30 backdrop-blur-sm">
      <div className="h-full w-full max-w-md translate-x-0 bg-white p-4 shadow-xl transition-transform dark:bg-zinc-950">
        <button
          type="button"
          onClick={handleClose}
          className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          ×
        </button>
        <div className="h-[calc(100%-2.5rem)]">{children}</div>
      </div>
    </div>
  );
}

type SheetHeaderProps = {
  children: ReactNode;
};

export function SheetHeader(props: SheetHeaderProps) {
  const { children } = props;
  return (
    <div className="mb-3 space-y-1">{children}</div>
  );
}

type SheetTitleProps = {
  children: ReactNode;
};

export function SheetTitle(props: SheetTitleProps) {
  const { children } = props;
  return (
    <h2 className={cn("text-base font-semibold")}>{children}</h2>
  );
}

