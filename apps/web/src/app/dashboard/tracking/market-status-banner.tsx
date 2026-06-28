'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MarketStatus } from './ticker-types'

type Props = {
  exchange?: string
}

function formatSessionTime(value: string | null) {
  if (!value) return '—'

  const date = new Date(value.replace(' ', 'T') + 'Z')
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getBannerTone(status: MarketStatus) {
  if (status.holiday) {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-700'
  }

  if (status.isOpen) {
    return 'border-green-500/20 bg-green-500/10 text-green-700'
  }

  return 'border-muted bg-muted/40 text-muted-foreground'
}

function getBannerLabel(status: MarketStatus) {
  if (status.holiday) {
    return `Market holiday${status.holiday ? ` · ${status.holiday}` : ''}`
  }

  return status.isOpen ? 'Market open' : 'Market closed'
}

export function MarketStatusBanner({ exchange = 'US' }: Props) {
  const [status, setStatus] = useState<MarketStatus | null>(null)
  const [error, setError] = useState(false)

  const realtimeBase = process.env.NEXT_PUBLIC_REALTIME_URL

  const statusUrl = useMemo(() => {
    if (!realtimeBase) {
      throw new Error('Missing NEXT_PUBLIC_REALTIME_URL')
    }

    return `${realtimeBase}/market-status?exchange=${encodeURIComponent(exchange)}`
  }, [exchange, realtimeBase])

  useEffect(() => {
    let cancelled = false

    async function loadMarketStatus() {
      try {
        const response = await fetch(statusUrl)

        if (!response.ok) {
          throw new Error('Failed to load market status')
        }

        const data = (await response.json()) as MarketStatus
        if (cancelled) return

        setStatus(data)
        setError(false)
      } catch {
        if (cancelled) return
        setError(true)
      }
    }

    loadMarketStatus()

    return () => {
      cancelled = true
    }
  }, [statusUrl])

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
        Unable to load market status.
      </div>
    )
  }

  if (!status) {
    return (
      <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Loading market status...
      </div>
    )
  }

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${getBannerTone(status)}`}>
      <div className="font-medium">{getBannerLabel(status)}</div>

      <div className="mt-1 text-xs opacity-80">
        {status.isOpen
          ? `Session closes at ${formatSessionTime(status.sessionClose)}`
          : `Session opens at ${formatSessionTime(status.sessionOpen)}`}
      </div>
    </div>
  )
}