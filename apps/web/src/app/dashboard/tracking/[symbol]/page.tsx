import Link from 'next/link'
import Image from 'next/image'
import type { AssetDetailsResponse } from '../asset-types'
import {
  formatDate,
  formatDateTimeFromUnix,
  formatMarketCap,
  formatNumber,
  formatPercent,
  formatPercentChange,
  formatPrice,
  formatSignedPrice,
  getPercentChangeClass,
} from '../ticker-utils'

type PageProps = {
  params: Promise<{
    symbol: string
  }>
}

type MetricProps = {
  label: string
  value: string
  description: string
  highlight?: boolean
  tone?: 'default' | 'primary' | 'success' | 'danger' | 'warning'
}

function Metric({
  label,
  value,
  description,
  highlight = false,
  tone = 'default',
}: MetricProps) {
  const toneMap = {
    default: 'border-border/70 bg-surface/80',
    primary: 'border-primary/20 bg-primary/10 shadow-[0_0_0_1px_rgba(79,140,255,0.08)]',
    success: 'border-green-500/20 bg-green-500/10',
    danger: 'border-red-500/20 bg-red-500/10',
    warning: 'border-amber-500/20 bg-amber-500/10',
  }

  const toneClass = highlight ? toneMap[tone] : toneMap.default

  return (
    <div
      className={`group relative overflow-visible rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:border-border ${toneClass}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          {label}
        </span>

        <button
          type="button"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border/80 text-[10px] text-muted transition hover:border-primary/40 hover:text-foreground"
          aria-label={`More information about ${label}`}
        >
          i
        </button>
      </div>

      <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-[2rem]">
        {value}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 w-12 rounded-full bg-white/6">
          <div
            className={`h-1.5 rounded-full ${
              highlight ? 'w-9 bg-primary' : 'w-6 bg-white/15'
            }`}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-64 rounded-xl border border-border bg-surface-2 p-3 text-xs leading-5 text-foreground shadow-2xl group-hover:block group-focus-within:block">
        {description}
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/70 py-4 last:border-b-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-base font-semibold tracking-tight text-foreground">
        {value}
      </span>
    </div>
  )
}

async function getAssetDetails(symbol: string): Promise<AssetDetailsResponse> {
  const realtimeBase = process.env.NEXT_PUBLIC_REALTIME_URL

  if (!realtimeBase) {
    throw new Error('Missing NEXT_PUBLIC_REALTIME_URL')
  }

  const response = await fetch(
    `${realtimeBase}/asset?symbol=${encodeURIComponent(symbol)}`,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch asset details for ${symbol}`)
  }

  return response.json()
}

export default async function AssetDetailPage({ params }: PageProps) {
  const { symbol } = await params
  const decodedSymbol = decodeURIComponent(symbol).toUpperCase()
  const asset = await getAssetDetails(decodedSymbol)

  const profile = asset.profile
  const quote = asset.quote
  const metrics = asset.basicFinancials?.metric ?? {}
  const latestRecommendation = asset.recommendations?.[0]
  const latestReport = asset.financialsReported?.data?.[0]

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/dashboard/tracking" className="transition hover:text-foreground">
          Tracking
        </Link>
        <span>/</span>
        <span className="text-foreground">{asset.symbol}</span>
      </div>

      <section className="rounded-3xl border border-border bg-linear-to-br from-surface via-surface to-primary/5 p-6 md:p-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {profile.name ?? asset.symbol}
              </h1>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                {profile.ticker ?? asset.symbol}
              </span>
            </div>

            <p className="mt-2 text-sm text-muted">
              {[profile.exchange, profile.currency, profile.finnhubIndustry]
                .filter(Boolean)
                .join(' · ') || 'No company profile metadata available.'}
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Current price
                </div>
                <div className="mt-2 text-5xl font-semibold tracking-tight md:text-6xl">
                  {formatPrice(quote.c, profile.currency)}
                </div>
              </div>

              <div
                className={`inline-flex min-h-11 items-center rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-semibold ${getPercentChangeClass(
                  quote.dp
                )}`}
              >
                {quote.d !== undefined && quote.d !== null
                  ? `${formatSignedPrice(quote.d)} · ${formatPercentChange(quote.dp)}`
                  : 'No intraday change available'}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric
                label="Open"
                value={formatPrice(quote.o, profile.currency)}
                description="Opening trading price for the current market session."
              />
              <Metric
                label="Previous close"
                value={formatPrice(quote.pc, profile.currency)}
                description="Final trading price from the previous session."
              />
              <Metric
                label="Day high"
                value={formatPrice(quote.h, profile.currency)}
                description="Highest traded price recorded during the current session."
                highlight
                tone="primary"
              />
              <Metric
                label="Day low"
                value={formatPrice(quote.l, profile.currency)}
                description="Lowest traded price recorded during the current session."
              />
            </div>
          </div>

          {profile.logo ? (
            <div className="relative h-20 w-20 shrink-0 rounded-2xl border border-border bg-surface-2 shadow-lg">
              <Image
                src={profile.logo}
                alt={`${profile.name ?? asset.symbol} logo`}
                fill
                className="object-contain p-3"
                sizes="80px"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold tracking-tight">Basic financials</h2>
          <p className="mt-1 text-sm text-muted">
            Core valuation and range metrics.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Metric
              label="52 week high"
              value={formatPrice(
                typeof metrics['52WeekHigh'] === 'number' ? metrics['52WeekHigh'] : null,
                profile.currency
              )}
              description="Highest traded price over the last 52 weeks."
              highlight
              tone="primary"
            />
            <Metric
              label="52 week low"
              value={formatPrice(
                typeof metrics['52WeekLow'] === 'number' ? metrics['52WeekLow'] : null,
                profile.currency
              )}
              description="Lowest traded price over the last 52 weeks."
            />
            <Metric
              label="P/E ratio"
              value={formatNumber(
                typeof metrics['peNormalizedAnnual'] === 'number'
                  ? metrics['peNormalizedAnnual']
                  : null
              )}
              description="Price-to-earnings ratio comparing share price to annual earnings per share."
            />
            <Metric
              label="Dividend yield"
              value={formatPercent(
                typeof metrics['dividendYieldIndicatedAnnual'] === 'number'
                  ? metrics['dividendYieldIndicatedAnnual']
                  : null
              )}
              description="Annual dividend per share divided by the current share price."
              highlight
              tone="warning"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold tracking-tight">Snapshot</h2>
          <p className="mt-1 text-sm text-muted">
            Quick company details and quote metadata.
          </p>

          <div className="mt-5 rounded-2xl border border-border/70 bg-surface-2 px-4">
            <DetailRow
              label="Market cap"
              value={formatMarketCap(profile.marketCapitalization)}
            />
            <DetailRow label="IPO date" value={formatDate(profile.ipo)} />
            <DetailRow label="Country" value={profile.country ?? '—'} />
            <DetailRow
              label="Latest quote time"
              value={formatDateTimeFromUnix(quote.t)}
            />
          </div>

          {profile.weburl ? (
            <a
              href={profile.weburl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Visit company website
            </a>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold tracking-tight">Recommendation trends</h2>
          <p className="mt-1 text-sm text-muted">
            Latest analyst sentiment snapshot.
          </p>

          {latestRecommendation ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Metric
                label="Strong buy"
                value={formatNumber(latestRecommendation.strongBuy)}
                description="Analyst ratings with the strongest positive conviction."
                highlight
                tone="success"
              />
              <Metric
                label="Buy"
                value={formatNumber(latestRecommendation.buy)}
                description="Analyst ratings indicating expected upside."
                highlight
                tone="success"
              />
              <Metric
                label="Hold"
                value={formatNumber(latestRecommendation.hold)}
                description="Analyst ratings suggesting investors maintain their current position."
                highlight
                tone="warning"
              />
              <Metric
                label="Sell"
                value={formatNumber(latestRecommendation.sell)}
                description="Analyst ratings indicating expected downside."
                highlight
                tone="danger"
              />
              <Metric
                label="Strong sell"
                value={formatNumber(latestRecommendation.strongSell)}
                description="Analyst ratings with the strongest negative conviction."
                highlight
                tone="danger"
              />
              <Metric
                label="Period"
                value={latestRecommendation.period ?? '—'}
                description="Reporting period associated with the recommendation summary."
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              No recommendation trend data available.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold tracking-tight">Financials as reported</h2>
          <p className="mt-1 text-sm text-muted">
            Latest reported filing metadata.
          </p>

          {latestReport ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Metric
                label="Form"
                value={latestReport.form ?? '—'}
                description="Filing form type reported by the company."
              />
              <Metric
                label="Fiscal year"
                value={formatNumber(latestReport.year)}
                description="Fiscal year associated with this filing."
                highlight
                tone="primary"
              />
              <Metric
                label="Quarter"
                value={formatNumber(latestReport.quarter)}
                description="Fiscal quarter associated with this filing."
              />
              <Metric
                label="Accepted"
                value={formatDate(latestReport.acceptedDate)}
                description="Date the filing was accepted by the receiving authority."
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              No reported financial filings available.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Company news</h2>
            <p className="mt-1 text-sm text-muted">
              Recent headlines related to {profile.name ?? asset.symbol}.
            </p>
          </div>
        </div>

        {asset.news?.length ? (
          <div className="mt-5 grid gap-4">
            {asset.news.slice(0, 8).map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-border bg-surface-2 p-4 transition hover:border-primary/30 hover:bg-primary/4"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>{item.source ?? 'Unknown source'}</span>
                  <span>·</span>
                  <span>{formatDateTimeFromUnix(item.datetime)}</span>
                </div>

                <h3 className="mt-2 text-base font-semibold tracking-tight text-foreground">
                  {item.headline ?? 'Untitled article'}
                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                  {item.summary ?? 'No summary available.'}
                </p>
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">
            No recent company news available.
          </p>
        )}
      </section>
    </div>
  )
}