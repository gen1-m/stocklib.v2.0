export type FinnhubTrade = {
  p: number
  s: string
  t: number
  v: number
}

export type FinnhubMessage = {
  type: string
  data?: FinnhubTrade[]
}

export type TickerUpdate = {
  symbol: string
  price: number
  timestamp: number
  volume: number
}

export type FinnhubQuote = {
  c?: number
  d?: number
  dp?: number
  h?: number
  l?: number
  o?: number
  pc?: number
  t?: number
}

export type FinnhubFinancialsResponse = {
  metric?: Record<string, number | string | null>
  series?: Record<string, unknown>
}

export type FinnhubFinancialsReportedResponse = {
  data?: Array<{
    accessNumber?: string
    symbol?: string
    cik?: string
    year?: number
    quarter?: number
    form?: string
    startDate?: string
    endDate?: string
    acceptedDate?: string
    report?: {
      bs?: Array<Record<string, unknown>>
      cf?: Array<Record<string, unknown>>
      ic?: Array<Record<string, unknown>>
    }
  }>
}

export type FinnhubRecommendationTrendItem = {
  buy?: number
  hold?: number
  period?: string
  sell?: number
  strongBuy?: number
  strongSell?: number
  symbol?: string
}

export type FinnhubNewsResponse = {
  news: FinnhubNewsItem[]
}

export type FinnhubProfile = {
  name?: string
  ticker?: string
  currency?: string
  exchange?: string
  finnhubIndustry?: string
  logo?: string
  marketCapitalization?: number
  country?: string
  ipo?: string
  weburl?: string
}


export type FinnhubMarketStatus = {
  exchange?: string
  holiday?: string
  isOpen?: boolean
  sessionOpen?: string | null
  sessionClose?: string | null
  t?: number
}


export type FinnhubSearchResult = {
  description?: string
  displaySymbol?: string
  symbol?: string
  type?: string
}


export type FinnhubSearchResponse = {
  result?: FinnhubSearchResult[]
}


export type FinnhubNewsItem = {
  id?: number
  category?: string
  datetime?: number | null
  headline?: string
  related?: string
  source?: string
  summary?: string
  url?: string
}