"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/auth/user-menu";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/conversations", label: "My Chats" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/" || pathname.startsWith("/dashboard");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCloseMobile = () => {
    setMobileOpen(false);
  };

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Open navigation menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 sm:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <span className="flex flex-col items-center justify-center gap-1.5">
              <span className="h-[1.5px] w-4 bg-current" />
              <span className="h-[1.5px] w-4 bg-current" />
              <span className="h-[1.5px] w-4 bg-current" />
            </span>
          </button>
          <Link
            href="/dashboard"
            className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            Loan Picks
          </Link>
          <nav className="hidden items-center gap-4 text-xs font-medium text-zinc-600 dark:text-zinc-300 sm:flex">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "hover:text-zinc-900 dark:hover:text-zinc-50",
                    active && "text-zinc-900 dark:text-zinc-50 font-semibold"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <UserMenu />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-zinc-950 sm:hidden">
          <div className="flex h-full flex-col p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Menu
              </span>
              <button
                type="button"
                aria-label="Close navigation menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                onClick={handleCloseMobile}
              >
                ×
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-2 text-sm font-medium text-zinc-700 bg-black dark:text-zinc-200">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={handleCloseMobile}
                    className={cn(
                      "rounded-md px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900",
                      active &&
                        "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 font-semibold"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

