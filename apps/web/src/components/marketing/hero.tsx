import Link from "next/link";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
      <div>
        <div className="font-fira-sans inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted">
          Market intelligence platform
        </div>
        <h1 className="font-cabin mt-6 max-w-3xl text-4xl tracking-tight md:text-6xl">
          Research markets faster, monitor conviction, and act with more clarity.
        </h1>
        <p className="font-fira-sans font-extralight mt-6 max-w-2xl text-base leading-7 text-muted md:text-lg">
          StockLib helps you track stocks, crypto, headlines, watchlists, and
          signal-driven insights in one focused workspace.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground transition hover:opacity-90"
          >
            Open dashboard
          </Link>
          <a
            href="#features"
            className="rounded-full border border-border px-5 py-3 text-sm text-foreground transition hover:bg-surface scroll-smooth"
          >
            Explore features
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted">
          <p>Watchlists</p>
          <p>Signals</p>
          <p>News context</p>
          <p>Portfolio snapshots</p>
        </div>
      </div>

      <div
        id="platform"
        className="font-cabin rounded-[28px] border border-border bg-surface p-4 shadow-2xl shadow-black/20"
      >
        <div className="rounded-[22px] border border-border bg-surface-2 p-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-sm text-muted">Portfolio overview</p>
              <p className="mt-1 text-2xl">$124,320</p>
            </div>
            <div className="rounded-full bg-success/15 px-3 py-1 text-sm text-success">
              +4.8%
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-sm text-muted">Top mover</p>
              <p className="mt-2 text-xl">NVDA</p>
              <p className="mt-1 text-sm text-success">+2.4% today</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-sm text-muted">Active alerts</p>
              <p className="mt-2 text-xl">3</p>
              <p className="mt-1 text-sm text-warning">2 need review</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4 sm:col-span-2">
              <p className="text-sm text-muted">AI research summary</p>
              <p className="mt-2 text-sm leading-6 text-foreground/90">
                Growth leadership remains intact, but breadth and earnings revision
                quality should decide position sizing over the next two weeks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}