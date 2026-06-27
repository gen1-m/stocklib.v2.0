import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
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
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Portfolio value" value="$124,320" change="+4.8% this month" />
        <StatCard label="Daily return" value="+$1,284" change="+1.1% today" />
        <StatCard label="Watchlist movers" value="12" change="3 above target" />
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
          title="Tracking"
          description="Your highest-priority instruments for the next session."
        >
          <div className="space-y-3">
            {[
              ["NVDA", "$141.22", "+2.4%"],
              ["MSFT", "$512.09", "+0.8%"],
              ["TSLA", "$219.41", "-1.6%"],
            ].map(([symbol, price, move]) => (
              <div
                key={symbol}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3"
              >
                <div>
                  <p className="font-medium font-sans">{symbol}</p>
                  <p className="text-sm text-muted">{price}</p>
                </div>
                <p
                  className={`text-sm font-medium ${
                    move.startsWith("+") ? "text-success" : "text-danger"
                  }`}
                >
                  {move}
                </p>
              </div>
            ))}
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