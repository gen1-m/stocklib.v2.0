import { LiveTickerGrid } from './live-ticker-grid'
import { LiveTickerProvider } from './live-ticker-provider'
import { MarketStatusBanner } from './market-status-banner'
import type { ProfilesResponse, QuotesResponse, Ticker } from './ticker-types'
import {
  applyProfile,
  applyQuote,
  buildTickerUrl,
  createInitialTickers,
} from './ticker-utils'

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'META', 'TSLA']

async function getInitialTickers(): Promise<Ticker[]> {
  const realtimeBase = process.env.NEXT_PUBLIC_REALTIME_URL

  if (!realtimeBase) {
    throw new Error('Missing NEXT_PUBLIC_REALTIME_URL')
  }

  const [quotesResponse, profilesResponse] = await Promise.all([
    fetch(buildTickerUrl(realtimeBase, 'quotes', DEFAULT_SYMBOLS), {
      next: { revalidate: 60 },
    }),
    fetch(buildTickerUrl(realtimeBase, 'profiles', DEFAULT_SYMBOLS), {
      next: { revalidate: 60 * 60 },
    }),
  ])

  if (!quotesResponse.ok) {
    throw new Error('Failed to load quotes')
  }

  if (!profilesResponse.ok) {
    throw new Error('Failed to load profiles')
  }

  const quotesData = (await quotesResponse.json()) as QuotesResponse
  const profilesData = (await profilesResponse.json()) as ProfilesResponse

  const quoteMap = new Map(
    quotesData.quotes.map((quote) => [quote.symbol, quote])
  )

  const profileMap = new Map(
    profilesData.profiles.map((profile) => [profile.symbol, profile])
  )

  return createInitialTickers(DEFAULT_SYMBOLS).map((ticker) => {
    const withQuote = applyQuote(ticker, quoteMap.get(ticker.symbol))
    return applyProfile(withQuote, profileMap.get(ticker.symbol))
  })
}

export default async function TrackingPage() {
  const initialTickers = await getInitialTickers()

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tracking</h1>
        <p className="text-sm text-muted-foreground">
          Live ticker updates streamed from the realtime service.
        </p>
      </div>

      <LiveTickerProvider initialTickers={initialTickers}>
        <MarketStatusBanner />
        <LiveTickerGrid initialSymbols={initialTickers.map((ticker) => ticker.symbol)} />
      </LiveTickerProvider>
    </section>
  )
}