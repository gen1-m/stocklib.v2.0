'use client'

import dynamic from 'next/dynamic'
import { TickerCard } from './ticker-card'
import { useLiveTickers } from './live-ticker-provider'

const TrackingUpdateControls = dynamic(
  () =>
    import('./tracking-update-controls').then(
      (mod) => mod.TrackingUpdateControls
    ),
  { ssr: false }
)

type LiveTickerGridProps = {
  initialSymbols: string[]
}

export function LiveTickerGrid({ initialSymbols: _initialSymbols }: LiveTickerGridProps) {
  const { tickers } = useLiveTickers()

  return (
    <div className="space-y-4">
      <TrackingUpdateControls />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tickers.map((ticker) => (
          <TickerCard key={ticker.symbol} ticker={ticker} />
        ))}
      </div>
    </div>
  )
}