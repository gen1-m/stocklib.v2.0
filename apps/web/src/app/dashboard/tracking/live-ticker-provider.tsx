'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  PendingTickerUpdates,
  StreamMessage,
  Ticker,
  TickerStatus,
} from './ticker-types'
import {
  applyPendingTickerUpdates,
  buildWebSocketUrl,
} from './ticker-utils'

type LiveTickerContextValue = {
  tickers: Ticker[]
  connectionState: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error'
  hasPendingUpdates: boolean
  pendingUpdateCount: number
  applyPendingUpdates: () => void
  discardPendingUpdates: () => void
}

const LiveTickerContext = createContext<LiveTickerContextValue | null>(null)

export function LiveTickerProvider({
  children,
  initialTickers,
}: {
  children: ReactNode
  initialTickers: Ticker[]
}) {
  const realtimeBase = process.env.NEXT_PUBLIC_REALTIME_URL

  const symbols = useMemo(
    () => initialTickers.map((ticker) => ticker.symbol),
    [initialTickers]
  )

  const [baseTickers, setBaseTickers] = useState<Ticker[]>(initialTickers)
  const [tickers, setTickers] = useState<Ticker[]>(initialTickers)
  const [pendingUpdates, setPendingUpdates] = useState<PendingTickerUpdates>({})
  const [connectionState, setConnectionState] = useState<
    'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error'
  >('idle')

  const hasDataRef = useRef(initialTickers.some((ticker) => ticker.price !== null))
  const reconnectTimerRef = useRef<number | null>(null)

  const wsUrl = useMemo(() => {
    if (!realtimeBase) {
      throw new Error('Missing NEXT_PUBLIC_REALTIME_URL')
    }

    return buildWebSocketUrl(realtimeBase, symbols)
  }, [realtimeBase, symbols])

  useEffect(() => {
    let cancelled = false
    let socket: WebSocket | null = null

    const connect = () => {
      if (cancelled) return

      setConnectionState(hasDataRef.current ? 'reconnecting' : 'connecting')

      socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        if (cancelled) return

        setConnectionState('connected')
        setTickers((current) =>
          current.map((ticker) => {
            if (ticker.status === 'reconnecting' || ticker.status === 'error') {
              return {
                ...ticker,
                status: ticker.price !== null ? 'live' : 'waiting',
              }
            }

            return ticker
          })
        )
      }

      socket.onmessage = (event) => {
        if (cancelled) return

        const payload = JSON.parse(event.data) as StreamMessage

        if (payload.event !== 'ticker') {
          return
        }

        const update = payload.data

        hasDataRef.current = true
        setConnectionState('connected')

        setPendingUpdates((current) => ({
          ...current,
          [update.symbol]: update,
        }))
      }

      socket.onerror = () => {
        if (cancelled) return
        setConnectionState(hasDataRef.current ? 'reconnecting' : 'error')
      }

      socket.onclose = () => {
        if (cancelled) return

        setConnectionState(hasDataRef.current ? 'reconnecting' : 'error')

        setTickers((current) =>
          current.map((ticker) => {
            if (ticker.price !== null) {
              return { ...ticker, status: 'reconnecting' as TickerStatus }
            }

            return {
              ...ticker,
              status: hasDataRef.current
                ? ('reconnecting' as TickerStatus)
                : ('error' as TickerStatus),
            }
          })
        )

        reconnectTimerRef.current = window.setTimeout(connect, 2000)
      }
    }

    connect()

    return () => {
      cancelled = true

      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current)
      }

      socket?.close()
    }
  }, [wsUrl])

  const applyPendingUpdates = useCallback(() => {
    setTickers((current) => applyPendingTickerUpdates(current, pendingUpdates))
    setBaseTickers((current) => applyPendingTickerUpdates(current, pendingUpdates))
    setPendingUpdates({})
  }, [pendingUpdates])

  const discardPendingUpdates = useCallback(() => {
    setPendingUpdates({})
    setTickers(baseTickers)
  }, [baseTickers])

  const hasPendingUpdates = Object.keys(pendingUpdates).length > 0
  const pendingUpdateCount = Object.keys(pendingUpdates).length

  const value = useMemo(
    () => ({
      tickers,
      connectionState,
      hasPendingUpdates,
      pendingUpdateCount,
      applyPendingUpdates,
      discardPendingUpdates,
    }),
    [
      tickers,
      connectionState,
      hasPendingUpdates,
      pendingUpdateCount,
      applyPendingUpdates,
      discardPendingUpdates,
    ]
  )

  return (
    <LiveTickerContext.Provider value={value}>
      {children}
    </LiveTickerContext.Provider>
  )
}

export function useLiveTickers() {
  const context = useContext(LiveTickerContext)

  if (!context) {
    throw new Error('useLiveTickers must be used within LiveTickerProvider')
  }

  return context
}