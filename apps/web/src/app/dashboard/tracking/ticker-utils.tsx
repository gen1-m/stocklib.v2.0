import type {
  CompanyProfile,
  PendingTickerUpdates,
  Quote,
  Ticker,
  TickerUpdate,
} from './ticker-types'

export function createInitialTickers(symbols: string[]): Ticker[] {
  return symbols.map((symbol) => ({
    symbol,
    name: symbol,
    ticker: symbol,
    currency: null,
    exchange: null,
    finnhubIndustry: null,
    logo: null,
    marketCapitalization: null,
    country: null,
    ipo: null,
    weburl: null,
    price: null,
    change: null,
    percentChange: null,
    high: null,
    low: null,
    open: null,
    previousClose: null,
    timestamp: null,
    volume: null,
    status: 'waiting',
  }))
}

export function buildTickerUrl(
  base: string,
  path: 'quotes' | 'profiles' | 'market-status' | 'asset' | 'search',
  symbols?: string[]
) {
  const url = new URL(`${base}/${path}`)

  if (symbols?.length) {
    url.searchParams.set('symbols', symbols.join(','))
  }

  return url.toString()
}

export function buildWebSocketUrl(base: string, symbols: string[]) {
  const httpUrl = new URL(base)
  const protocol = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = new URL(httpUrl.toString())
  wsUrl.protocol = protocol
  wsUrl.pathname = `${wsUrl.pathname.replace(/\/$/, '')}/ws`
  wsUrl.searchParams.set('symbols', symbols.join(','))
  return wsUrl.toString()
}

export function applyQuote(ticker: Ticker, quote?: Quote): Ticker {
  if (!quote) return ticker

  return {
    ...ticker,
    price: quote.price ?? null,
    change: quote.change ?? null,
    percentChange: quote.percentChange ?? null,
    high: quote.high ?? null,
    low: quote.low ?? null,
    open: quote.open ?? null,
    previousClose: quote.previousClose ?? null,
    timestamp: quote.timestamp ?? null,
    status: quote.price !== null ? 'live' : ticker.status,
  }
}

export function applyProfile(ticker: Ticker, profile?: CompanyProfile): Ticker {
  if (!profile) return ticker

  return {
    ...ticker,
    name: profile.name ?? ticker.name,
    ticker: profile.ticker ?? ticker.ticker,
    currency: profile.currency ?? null,
    exchange: profile.exchange ?? null,
    finnhubIndustry: profile.finnhubIndustry ?? null,
    logo: profile.logo ?? null,
    marketCapitalization: profile.marketCapitalization ?? null,
    country: profile.country ?? null,
    ipo: profile.ipo ?? null,
    weburl: profile.weburl ?? null,
  }
}

export function applyUpdate(ticker: Ticker, update: TickerUpdate): Ticker {
  if (ticker.symbol !== update.symbol) return ticker

  return {
    ...ticker,
    price: update.price,
    timestamp: update.timestamp,
    volume: update.volume,
    status: 'live',
  }
}

export function applyPendingTickerUpdates(
  tickers: Ticker[],
  updates: PendingTickerUpdates
): Ticker[] {
  return tickers.map((ticker) => {
    const update = updates[ticker.symbol]
    return update ? applyUpdate(ticker, update) : ticker
  })
}

export function getPercentChangeClass(percentChange?: number | null) {
  if (percentChange === null || percentChange === undefined) {
    return 'text-muted'
  }

  return percentChange >= 0 ? 'text-green-500' : 'text-red-500'
}

export function getValueToneClass(value?: number | null) {
  if (value === null || value === undefined) return 'text-foreground'
  return value >= 0 ? 'text-green-500' : 'text-red-500'
}

export function formatPrice(price: number | null | undefined, currency?: string | null) {
  if (price === null || price === undefined) return '—'
  return `${price.toFixed(2)}${currency ? ` ${currency}` : ''}`
}

export function formatPlainPrice(price: number | null) {
  return price !== null ? price.toFixed(2) : '—'
}

export function formatSignedPrice(value?: number | null) {
  if (value === null || value === undefined) {
    return '—'
  }

  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

export function formatPercentChange(percentChange?: number | null) {
  if (percentChange === null || percentChange === undefined) {
    return 'No change data yet'
  }

  const sign = percentChange > 0 ? '+' : ''
  return `${sign}${percentChange.toFixed(2)}%`
}

export function formatTimestamp(timestamp?: number | null) {
  if (!timestamp) {
    return 'Waiting for live data'
  }

  return `Last updated: ${new Date(timestamp).toLocaleTimeString()}`
}

export function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return '—'
  return value.toLocaleString()
}

export function formatMarketCap(value?: number | null) {
  if (value === null || value === undefined) return '—'
  value = value * 1_000_000
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    compactDisplay: 'short',
    notation: 'compact',
  })
}

export function formatPercent(value?: number | null) {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(2)}%`
}

export function formatDate(value?: string | number) {
  if (!value) return '—'

  const date =
    typeof value === 'number' ? new Date(value * 1000) : new Date(value)

  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString()
}

export function formatDateTimeFromUnix(value?: number) {
  if (!value) return '—'
  return new Date(value * 1000).toLocaleString()
}