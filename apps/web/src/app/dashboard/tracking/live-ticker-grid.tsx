'use client'

import { useEffect, useMemo, useState } from 'react'
import { TickerCard } from './ticker-card'
import type {
  ProfilesResponse,
  QuotesResponse,
  Ticker,
  TickerUpdate,
} from './ticker-types'
import {
  applyProfile,
  applyQuote,
  applyUpdate,
  buildTickerUrl,
  createInitialTickers,
} from './ticker-utils'

type LiveTickerGridProps = {
  initialSymbols: string[]
}

export function LiveTickerGrid({ initialSymbols }: LiveTickerGridProps) {
  const [tickers, setTickers] = useState<Ticker[]>(() =>
    createInitialTickers(initialSymbols)
  )

  const realtimeBase = process.env.NEXT_PUBLIC_REALTIME_URL

  const quotesUrl = useMemo(() => {
    if (!realtimeBase) {
      throw new Error('Missing NEXT_PUBLIC_REALTIME_URL')
    }

    return buildTickerUrl(realtimeBase, 'quotes', initialSymbols)
  }, [realtimeBase, initialSymbols])

  const profilesUrl = useMemo(() => {
    if (!realtimeBase) {
      throw new Error('Missing NEXT_PUBLIC_REALTIME_URL')
    }

    return buildTickerUrl(realtimeBase, 'profiles', initialSymbols)
  }, [realtimeBase, initialSymbols])

  const streamUrl = useMemo(() => {
    if (!realtimeBase) {
      throw new Error('Missing NEXT_PUBLIC_REALTIME_URL')
    }

    return buildTickerUrl(realtimeBase, 'stream', initialSymbols)
  }, [realtimeBase, initialSymbols])

  useEffect(() => {
    let cancelled = false

    async function loadInitialData() {
      try {
        const [quotesResponse, profilesResponse] = await Promise.all([
          fetch(quotesUrl),
          fetch(profilesUrl),
        ])

        if (!quotesResponse.ok) {
          throw new Error('Failed to load quotes')
        }

        if (!profilesResponse.ok) {
          throw new Error('Failed to load profiles')
        }

        const quotesData = (await quotesResponse.json()) as QuotesResponse
        const profilesData = (await profilesResponse.json()) as ProfilesResponse

        if (cancelled) return

        const quoteMap = new Map(
          quotesData.quotes.map((quote) => [quote.symbol, quote])
        )

        const profileMap = new Map(
          profilesData.profiles.map((profile) => [profile.symbol, profile])
        )

        setTickers((current) =>
          current.map((ticker) => {
            const withQuote = applyQuote(ticker, quoteMap.get(ticker.symbol))
            return applyProfile(withQuote, profileMap.get(ticker.symbol))
          })
        )
      } catch {
        if (cancelled) return

        setTickers((current) =>
          current.map((ticker) =>
            ticker.price === null ? { ...ticker, status: 'error' } : ticker
          )
        )
      }
    }

    loadInitialData()

    return () => {
      cancelled = true
    }
  }, [quotesUrl, profilesUrl])

  useEffect(() => {
    const source = new EventSource(streamUrl)

    const handleTicker = (event: Event) => {
      const update = JSON.parse((event as MessageEvent).data) as TickerUpdate

      setTickers((current) =>
        current.map((ticker) => applyUpdate(ticker, update))
      )
    }

    const handleError = () => {
      setTickers((current) =>
        current.map((ticker) =>
          ticker.status === 'live' ? ticker : { ...ticker, status: 'error' }
        )
      )
    }

    source.addEventListener('ticker', handleTicker)
    source.onerror = handleError

    return () => {
      source.removeEventListener('ticker', handleTicker)
      source.close()
    }
  }, [streamUrl])

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tickers.map((ticker) => (
        <TickerCard key={ticker.symbol} ticker={ticker} />
      ))}
    </div>
  )
}