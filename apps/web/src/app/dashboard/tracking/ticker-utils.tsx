import type { Quote, Ticker, TickerUpdate } from './ticker-types'

export function createInitialTickers(symbols: string[]): Ticker[] {
  return symbols.map((symbol) => ({
    symbol,
    price: null,
    status: 'waiting',
  }))
}

export function buildTickerUrl(
  base: string,
  path: 'quotes' | 'stream',
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
    return 'text-muted-foreground'
  }

  return percentChange >= 0 ? 'text-green-500' : 'text-red-500'
}

export function formatPrice(price: number | null) {
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