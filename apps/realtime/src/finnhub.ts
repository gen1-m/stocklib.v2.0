import WebSocket from 'ws'
import type { FinnhubMessage, TickerUpdate } from './types.ts'

type UpdateListener = (update: TickerUpdate) => void

export class FinnhubStream {
  private socket: WebSocket | null = null
  private listeners = new Set<UpdateListener>()
  private subscribedSymbols = new Set<string>()

  constructor(private readonly apiKey: string) {}

  connect() {
    console.log('[finnhub] connect() called')

    if (this.socket && (
      this.socket.readyState === WebSocket.OPEN ||
      this.socket.readyState === WebSocket.CONNECTING
    )) {
      return
    }

    this.socket = new WebSocket(`wss://ws.finnhub.io?token=${this.apiKey}`)

    this.socket.on('open', () => {
      console.log('[finnhub] connected')

      for (const symbol of this.subscribedSymbols) {
        this.send({ type: 'subscribe', symbol })
      }
    })

    this.socket.on('message', (raw) => {
      const text = raw.toString()
      console.log('[finnhub] message:', text)

      const msg = JSON.parse(text) as FinnhubMessage & { type: string }

      if (msg.type === 'ping') {
        this.send({ type: 'pong' })
        return
      }

      if (msg.type !== 'trade' || !msg.data) return

      for (const trade of msg.data) {
        const update: TickerUpdate = {
          symbol: trade.s,
          price: trade.p,
          timestamp: trade.t,
          volume: trade.v,
        }

        for (const listener of this.listeners) {
          listener(update)
        }
      }
    })

    this.socket.on('close', () => {
      console.log('[finnhub] closed')
      setTimeout(() => this.connect(), 2000)
    })

    this.socket.on('error', (error) => {
      console.error('[finnhub] error:', error)
    })
  }

  subscribe(symbol: string) {
    const normalized = symbol.trim().toUpperCase()
    if (!normalized) return

    this.subscribedSymbols.add(normalized)
    console.log('[finnhub] subscribe called:', normalized)

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.send({ type: 'subscribe', symbol: normalized })
    }
  }

  unsubscribe(symbol: string) {
    const normalized = symbol.trim().toUpperCase()
    if (!normalized) return

    this.subscribedSymbols.delete(normalized)
    console.log('[finnhub] unsubscribe called:', normalized)

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.send({ type: 'unsubscribe', symbol: normalized })
    }
  }

  onUpdate(listener: UpdateListener) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private send(payload: Record<string, string>) {
    console.log('[finnhub] sending payload:', payload)
    this.socket?.send(JSON.stringify(payload))
  }
}