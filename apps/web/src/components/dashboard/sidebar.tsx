import Link from "next/link";
import { NavLinks } from "./nav-links";

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-border bg-surface lg:block h-full">
      <div className="flex h-full flex-col px-5 py-6">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          StockLib
        </Link>

        <p className="mt-2 text-sm leading-6 text-muted">
          A focused workspace for market research, watchlists, and signals.
        </p>

        <div className="mt-8">
          <NavLinks />
        </div>

        <div className="mt-auto rounded-3xl border border-border bg-surface-2 p-4">
          <p className="text-sm font-medium">Next step</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Connect real market data and replace placeholder cards with live widgets.
          </p>
        </div>
      </div>
    </aside>
  );
}