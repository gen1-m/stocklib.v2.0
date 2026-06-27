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