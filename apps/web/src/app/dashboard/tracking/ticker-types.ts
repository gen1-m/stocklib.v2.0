export type TickerStatus = 'live' | 'waiting' | 'reconnecting' | 'error'
export type PendingTickerUpdates = Record<string, TickerUpdate>

export type CompanyProfile = {
  symbol: string
  name: string
  ticker: string
  currency: string | null
  exchange: string | null
  finnhubIndustry: string | null
  logo: string | null
  marketCapitalization: number | null
  country: string | null
  ipo: string | null
  weburl: string | null
}

export type Ticker = {
  symbol: string
  name: string | null
  ticker: string | null
  currency: string | null
  exchange: string | null
  finnhubIndustry: string | null
  logo: string | null
  marketCapitalization: number | null
  country: string | null
  ipo: string | null
  weburl: string | null
  price: number | null
  change: number | null
  percentChange: number | null
  high: number | null
  low: number | null
  open: number | null
  previousClose: number | null
  timestamp: number | null
  volume: number | null
  status: TickerStatus
}

export type Quote = {
  symbol: string
  price: number | null
  change: number | null
  percentChange: number | null
  high: number | null
  low: number | null
  open: number | null
  previousClose: number | null
  timestamp?: number
}

export type TickerUpdate = {
  symbol: string
  price: number
  timestamp: number
  volume: number
}

export type TickerMessage = {
  event: 'ticker'
  data: TickerUpdate
}

export type StreamMessage =
  | TickerMessage
  | {
      event: 'ready'
      data?: {
        symbols?: string[]
      }
    }
  | {
      event: 'error'
      data?: {
        message?: string
      }
    }

export type QuotesResponse = {
  quotes: Quote[]
}

export type ProfilesResponse = {
  profiles: CompanyProfile[]
}

export type MarketStatus = {
  exchange: string
  holiday: string
  isOpen: boolean
  sessionOpen: string | null
  sessionClose: string | null
  timestamp: number
}