import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { createClient } from "@/lib/supabase/server";
import { RefreshWatchlistForm } from "@/components/dashboard/refresh-watchlist-form";
import {
  getDefaultWatchlistSymbolsForUser,
  refreshSymbols,
} from "./actions";
import { getStaleCutoffIso } from "@/lib/staleness";

type WatchlistItemWithCompany = {
  id: string;
  symbol: string;
  added_at: string;
  companies: {
    symbol: string;
    name: string;
  } | null;
};

type PriceRow = {
  symbol: string;
  last_price: number | null;
  change_percent: number | null;
  fetched_at: string | null;
};

const STALE_MINUTES = 10;

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: watchlist } = await supabase
    .from("watchlists")
    .select(`
      id,
      name,
      watchlist_items (
        id,
        symbol,
        added_at,
        companies (
          symbol,
          name
        )
      )
    `)
    .eq("user_id", user!.id)
    .eq("is_default", true)
    .maybeSingle();

  const trackedItems = (watchlist?.watchlist_items ?? []) as unknown as WatchlistItemWithCompany[];
  const symbols = await getDefaultWatchlistSymbolsForUser(user!.id);

  let { data: prices } = symbols.length
    ? await supabase
      .from("price_cache")
      .select("symbol, last_price, change_percent, fetched_at")
      .in("symbol", symbols)
    : { data: [] as PriceRow[] };

  const staleCutoffIso = getStaleCutoffIso(STALE_MINUTES);

  const staleOrMissing = symbols.filter((symbol) => {
    const row = (prices ?? []).find((price) => price.symbol === symbol);

    if (!row?.fetched_at) return true;

    return row.fetched_at < staleCutoffIso;
  });

  if (staleOrMissing.length) {
    await refreshSymbols(staleOrMissing);

    const refreshed = await supabase
      .from("price_cache")
      .select("symbol, last_price, change_percent, fetched_at")
      .in("symbol", symbols);

    prices = refreshed.data ?? [];
  }

  const priceMap = new Map((prices ?? []).map((row) => [row.symbol, row]));

  const trackingRows = trackedItems.map((item) => {
    const price = priceMap.get(item.symbol);

    return {
      id: item.id,
      symbol: item.symbol,
      name: item.companies?.name ?? item.symbol,
      lastPrice: price?.last_price ?? null,
      changePercent: price?.change_percent ?? null,
    };
  });


  return (
    <div className="space-y-6">

      <section className="space-y-3 md:flex md:items-end md:justify-between md:space-y-0">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
            Overview
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Market intelligence at a glance
          </h1>
          <p className="max-w-2xl text-sm text-muted md:text-base">
            Track price movement, monitor your watchlist, and review signals from a
            single dashboard.
          </p>
        </div>

        <RefreshWatchlistForm />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Portfolio value" value="$124,320" change="+4.8% this month" />
        <StatCard label="Daily return" value="+$1,284" change="+1.1% today" />
        <StatCard
          label="Watchlist movers"
          value={String(trackingRows.length)}
          change="Tracked symbols"
        />
        <StatCard label="Alerts triggered" value="3" change="2 unread" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <SectionCard
          title="Market snapshot"
          description="US equities opened higher while growth stocks led early momentum."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <p className="text-sm text-muted">S&P 500</p>
              <p className="mt-2 text-2xl font-semibold">5,642</p>
              <p className="mt-1 text-sm text-success">+0.86%</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <p className="text-sm text-muted">NASDAQ</p>
              <p className="mt-2 text-2xl font-semibold">18,140</p>
              <p className="mt-1 text-sm text-success">+1.14%</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <p className="text-sm text-muted">BTC</p>
              <p className="mt-2 text-2xl font-semibold font-sans">$104,220</p>
              <p className="mt-1 text-sm text-danger">-0.42%</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title={watchlist?.name ?? "Tracking"}
          description="Your highest-priority instruments for the next session."
        >
          <div className="space-y-3">
            {trackingRows.length ? (
              trackingRows.map((item) => {
                const isPositive =
                  typeof item.changePercent === "number" && item.changePercent >= 0;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium font-sans">{item.symbol}</p>
                      <p className="text-sm text-muted">{item.name}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {item.lastPrice != null ? `$${item.lastPrice.toFixed(2)}` : "—"}
                      </p>
                      <p
                        className={`text-sm font-medium ${item.changePercent == null
                          ? "text-muted"
                          : isPositive
                            ? "text-success"
                            : "text-danger"
                          }`}
                      >
                        {item.changePercent != null
                          ? `${isPositive ? "+" : ""}${item.changePercent.toFixed(2)}%`
                          : "No change"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
                No symbols in your watchlist yet.
              </div>
            )}
          </div>
        </SectionCard>
      </section>

      <section>
        <SectionCard
          title="Recent signals"
          description="A placeholder feed for research notes, AI summaries, and alert events."
        >
          <div className="space-y-3">
            {[
              "AAPL broke above its 20-day moving average with stronger-than-average volume.",
              "ETH volatility compressed into a narrow range before the next macro catalyst.",
              "A new earnings note was added for AMD with revised margin expectations.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}