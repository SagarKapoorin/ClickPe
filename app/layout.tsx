import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserMenu } from "@/components/auth/user-menu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loan APP",
  description: "Get instant loan approvals with our AI-powered app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-background text-foreground">
          <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
                >
                  Loan Picks
                </Link>
                <nav className="hidden items-center gap-4 text-xs font-medium text-zinc-600 dark:text-zinc-300 sm:flex">
                  <Link
                    href="/dashboard"
                    className="hover:text-zinc-900 dark:hover:text-zinc-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/products"
                    className="hover:text-zinc-900 dark:hover:text-zinc-50"
                  >
                    Products
                  </Link>
                  <Link
                    href="/conversations"
                    className="hover:text-zinc-900 dark:hover:text-zinc-50"
                  >
                    My chats
                  </Link>
                </nav>
              </div>
              <UserMenu />
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
