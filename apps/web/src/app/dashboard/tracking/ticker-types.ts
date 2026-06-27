export type TickerStatus = 'live' | 'waiting' | 'error'

export type Ticker = {
  symbol: string
  price: number | null
  change?: number | null
  percentChange?: number | null
  high?: number | null
  low?: number | null
  open?: number | null
  previousClose?: number | null
  timestamp?: number
  volume?: number
  status: TickerStatus
}

export type Quote = {
  symbol: string
  price: number | null
  change?: number | null
  percentChange?: number | null
  high?: number | null
  low?: number | null
  open?: number | null
  previousClose?: number | null
  timestamp?: number
}

export type TickerUpdate = {
  symbol: string
  price: number
  timestamp: number
  volume: number
}

export type QuotesResponse = {
  quotes: Quote[]
}

export type MarketStatus = {
  exchange: string
  holiday: string
  isOpen: boolean
  sessionOpen: string | null
  sessionClose: string | null
  timestamp: number
}