import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="text-lg tracking-tight">
          StockLib
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="/features" className="transition hover:text-foreground">
            Features
          </a>
          <a href="/platform" className="transition hover:text-foreground">
            Platform
          </a>
          <Link href="/dashboard" className="transition hover:text-foreground">
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition hover:bg-surface"
          >
            Preview
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Open app
          </Link>
        </div>
      </div>
    </header>
  );
}