import { StatusBadge } from './status-badge'
import type { Ticker } from './ticker-types'
import {
  formatPercentChange,
  formatPrice,
  formatSignedPrice,
  formatTimestamp,
  getPercentChangeClass,
} from './ticker-utils'

type TickerCardProps = {
  ticker: Ticker
}

export function TickerCard({ ticker }: TickerCardProps) {
  const changeTone = getPercentChangeClass(ticker.percentChange)

  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{ticker.symbol}</div>
          <div className="text-xs text-muted-foreground">US equity</div>
        </div>

        <StatusBadge status={ticker.status} />
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold">{formatPrice(ticker.price)}</div>

        <div className={`mt-1 text-sm ${changeTone}`}>
          {formatPercentChange(ticker.percentChange)}
          {ticker.change !== null && ticker.change !== undefined && (
            <span className="ml-2">
              ({formatSignedPrice(ticker.change)})
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground">Previous close</div>
          <div className="mt-1 font-medium">{formatPrice(ticker.previousClose ?? null)}</div>
        </div>

        <div className="rounded-lg bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground">Volume</div>
          <div className="mt-1 font-medium">
            {ticker.volume !== null && ticker.volume !== undefined
              ? ticker.volume.toLocaleString()
              : '—'}
          </div>
        </div>

        <div className="rounded-lg bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground">Day high</div>
          <div className="mt-1 font-medium">{formatPrice(ticker.high ?? null)}</div>
        </div>

        <div className="rounded-lg bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground">Day low</div>
          <div className="mt-1 font-medium">{formatPrice(ticker.low ?? null)}</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        {formatTimestamp(ticker.timestamp)}
      </div>
    </div>
  )
}