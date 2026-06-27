'use client'

import { useEffect, useMemo, useState } from 'react'
import { TickerCard } from './ticker-card'
import type { QuotesResponse, Ticker, TickerUpdate } from './ticker-types'
import {
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

  const streamUrl = useMemo(() => {
    if (!realtimeBase) {
      throw new Error('Missing NEXT_PUBLIC_REALTIME_URL')
    }

    return buildTickerUrl(realtimeBase, 'stream', initialSymbols)
  }, [realtimeBase, initialSymbols])

  useEffect(() => {
    let cancelled = false

    async function loadQuotes() {
      try {
        const response = await fetch(quotesUrl)

        if (!response.ok) {
          throw new Error('Failed to load quotes')
        }

        const data = (await response.json()) as QuotesResponse
        if (cancelled) return

        const quoteMap = new Map(data.quotes.map((quote) => [quote.symbol, quote]))

        setTickers((current) =>
          current.map((ticker) => applyQuote(ticker, quoteMap.get(ticker.symbol)))
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

    loadQuotes()

    return () => {
      cancelled = true
    }
  }, [quotesUrl])

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