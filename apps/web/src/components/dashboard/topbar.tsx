import Link from "next/link";

export function Topbar() {
  return (
    <header className="border-b border-border bg-background/80 px-4 py-4 backdrop-blur-xl md:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Dashboard</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Overview</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted md:block">
            Search, symbols, notes…
          </div>
          <Link
            href="/"
            className="rounded-full border border-border px-4 py-2 text-sm transition hover:bg-surface"
          >
            Landing page
          </Link>
          <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
            New alert
          </button>
        </div>
      </div>
    </header>
  );
}