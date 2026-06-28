import type {
  CompanyProfile,
  Quote,
  Ticker,
  TickerUpdate,
} from './ticker-types'

export function createInitialTickers(symbols: string[]): Ticker[] {
  return symbols.map((symbol) => ({
    symbol,
    name: symbol,
    ticker: symbol,
    price: null,
    status: 'waiting',
  }))
}

export function buildTickerUrl(
  base: string,
  path: 'quotes' | 'stream' | 'profiles',
  symbols: string[]
) {
  const params = encodeURIComponent(symbols.join(','))
  return `${base}/${path}?symbols=${params}`
}

export function applyQuote(ticker: Ticker, quote?: Quote): Ticker {
  if (!quote) return ticker

  return {
    ...ticker,
    price: quote.price,
    change: quote.change,
    percentChange: quote.percentChange,
    high: quote.high,
    low: quote.low,
    open: quote.open,
    previousClose: quote.previousClose,
    timestamp: quote.timestamp,
    status: quote.price !== null ? 'live' : 'waiting',
  }
}

export function applyProfile(ticker: Ticker, profile?: CompanyProfile): Ticker {
  if (!profile) return ticker

  return {
    ...ticker,
    name: profile.name,
    ticker: profile.ticker,
    currency: profile.currency,
    exchange: profile.exchange,
    finnhubIndustry: profile.finnhubIndustry,
    logo: profile.logo,
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
  if (price === null) return '—'
  return `${price?.toFixed(2)}${currency ? ` ${currency}` : ''}`
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

export function formatTimestamp(timestamp?: number) {
  if (!timestamp) {
    return 'Waiting for live data'
  }

  return `Last updated: ${new Date(timestamp).toLocaleTimeString()}`
}

export function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return '—'
  return value.toLocaleString()
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