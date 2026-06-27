import Link from 'next/link'

import { StatusBadge } from './status-badge'
import type { Ticker } from './ticker-types'
import {
  formatPercentChange,
  formatPlainPrice,
  formatPrice,
  formatSignedPrice,
  formatTimestamp,
  getPercentChangeClass,
} from './ticker-utils'

type TickerCardProps = {
  ticker: Ticker
}

type MetricProps = {
  label: string
  value: string
  description: string
  highlight?: boolean
}

function Metric({ label, value, description, highlight = false }: MetricProps) {
  return (
    <div
      className={`group relative rounded-lg p-3 ${
        highlight ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted/30'
      }`}
    >
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px]">
          ?
        </span>
      </div>

      <div className="mt-1 font-medium">{value}</div>

      <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-56 rounded-lg border bg-background p-2 text-xs text-foreground shadow-md group-hover:block">
        {description}
      </div>
    </div>
  )
}

export function TickerCard({ ticker }: TickerCardProps) {
  const changeTone = getPercentChangeClass(ticker.percentChange)
  const companyName = ticker.name ?? ticker.symbol
  const companyTicker = ticker.ticker ?? ticker.symbol

  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/dashboard/tracking/${ticker.symbol}`}
            className="line-clamp-1 text-sm font-semibold hover:underline"
          >
            {companyName} <span className="text-muted-foreground">({companyTicker})</span>
          </Link>

          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {ticker.exchange && <span>{ticker.exchange}</span>}
            {ticker.currency && <span>· {ticker.currency}</span>}
            {ticker.finnhubIndustry && <span>· {ticker.finnhubIndustry}</span>}
          </div>
        </div>

        <StatusBadge status={ticker.status} />
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold">
          {formatPrice(ticker.price, ticker.currency)}
        </div>

        <div className={`mt-1 text-sm ${changeTone}`}>
          {formatPercentChange(ticker.percentChange)}
          {ticker.change !== null && ticker.change !== undefined && (
            <span className="ml-2">({formatSignedPrice(ticker.change)})</span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Metric
          label="Previous close"
          value={formatPlainPrice(ticker.previousClose ?? null)}
          description="The final trading price from the previous regular market session."
        />

        <Metric
          label="Volume"
          value={
            ticker.volume !== null && ticker.volume !== undefined
              ? ticker.volume.toLocaleString()
              : '—'
          }
          description="The number of shares traded during the current session."
        />

        <Metric
          label="Day high"
          value={formatPlainPrice(ticker.high ?? null)}
          description="The highest price the stock has reached during the current trading day."
          highlight
        />

        <Metric
          label="Day low"
          value={formatPlainPrice(ticker.low ?? null)}
          description="The lowest price the stock has traded at during the current trading day."
          highlight
        />
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        {formatTimestamp(ticker.timestamp)}
      </div>
    </div>
  )
}