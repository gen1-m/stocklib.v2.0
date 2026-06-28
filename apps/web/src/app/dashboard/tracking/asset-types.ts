export type AssetProfile = {
  country?: string
  currency?: string
  exchange?: string
  finnhubIndustry?: string
  ipo?: string
  logo?: string
  marketCapitalization?: number
  name?: string
  phone?: string
  shareOutstanding?: number
  ticker?: string
  weburl?: string
}

export type AssetQuote = {
  c?: number
  d?: number
  dp?: number
  h?: number
  l?: number
  o?: number
  pc?: number
  t?: number
}

export type AssetNewsItem = {
  id: number
  category?: string
  datetime?: number
  headline?: string
  image?: string
  related?: string
  source?: string
  summary?: string
  url?: string
}

export type BasicFinancialsResponse = {
  metric?: Record<string, number | string | null>
  series?: Record<string, unknown>
}

export type FinancialsReportedResponse = {
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

export type RecommendationTrendItem = {
  buy?: number
  hold?: number
  period?: string
  sell?: number
  strongBuy?: number
  strongSell?: number
  symbol?: string
}

export type AssetDetailsResponse = {
  symbol: string
  profile: AssetProfile
  quote: AssetQuote
  news: AssetNewsItem[]
  basicFinancials: BasicFinancialsResponse
  financialsReported: FinancialsReportedResponse
  recommendations: RecommendationTrendItem[]
}