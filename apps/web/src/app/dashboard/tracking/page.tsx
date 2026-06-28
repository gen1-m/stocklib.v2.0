import { LiveTickerGrid } from './live-ticker-grid'
import { MarketStatusBanner } from './market-status-banner'

export default function TrackingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tracking</h1>
        <p className="text-sm text-muted-foreground">
          Live ticker updates streamed from the realtime service.
        </p>
      </div>

      <MarketStatusBanner exchange="US" />

      <LiveTickerGrid
        initialSymbols={['AAPL', 'MSFT', 'NVDA', 'AMZN', 'META', 'TSLA']}
      />
    </div>
  )
}