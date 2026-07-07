import { DurableObject } from 'cloudflare:workers'
type Env = {
    FINNHUB_API_KEY: string
}

type FinnhubTrade = {
    s: string
    p: number
    t: number
    v: number
}

type FinnhubMessage =
    | { type: 'trade'; data?: FinnhubTrade[] }
    | { type: 'ping' }
    | { type: string;[key: string]: unknown }

type TickerUpdate = {
    symbol: string
    price: number
    timestamp: number
    volume: number
}

export class StreamRoom extends DurableObject<Env> {
    private clients = new Set<WebSocket>()
    private upstream: WebSocket | null = null
    private symbols = new Set<string>()
    private connected = false

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env)
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url)

        if (request.headers.get('Upgrade') !== 'websocket') {
            return new Response('Expected websocket', { status: 426 })
        }

        const symbols = (url.searchParams.get('symbols') ?? '')
            .split(',')
            .map((s) => s.trim().toUpperCase())
            .filter(Boolean)

        for (const symbol of symbols) {
            this.symbols.add(symbol)
        }

        const pair = new WebSocketPair()
        const client = pair[0]
        const server = pair[1]

        this.ctx.acceptWebSocket(server)
        this.clients.add(server)

        await this.ensureUpstream()

        return new Response(null, {
            status: 101,
            webSocket: client,
        })
    }

    async webSocketMessage(_ws: WebSocket, _message: string | ArrayBuffer): Promise<void> {
    }

    async webSocketClose(ws: WebSocket): Promise<void> {
        this.clients.delete(ws)
    }

    async webSocketError(ws: WebSocket): Promise<void> {
        this.clients.delete(ws)
    }

    private async ensureUpstream() {
        if (this.upstream && this.connected) return

        const ws = new WebSocket(`wss://ws.finnhub.io?token=${this.env.FINNHUB_API_KEY}`)
        this.upstream = ws

        ws.addEventListener('open', () => {
            this.connected = true

            for (const symbol of this.symbols) {
                ws.send(JSON.stringify({ type: 'subscribe', symbol }))
            }
        })

        ws.addEventListener('message', (event) => {
            const text = typeof event.data === 'string' ? event.data : ''
            if (!text) return

            const msg = JSON.parse(text) as FinnhubMessage

            if (msg.type === 'ping') {
                ws.send(JSON.stringify({ type: 'pong' }))
                return
            }

            if (msg.type !== 'trade' || !Array.isArray(msg.data)) return

            for (const trade of msg.data) {
                const update: TickerUpdate = {
                    symbol: trade.s,
                    price: trade.p,
                    timestamp: trade.t,
                    volume: trade.v,
                }

                const payload = JSON.stringify({
                    event: 'ticker',
                    data: update,
                })

                for (const client of this.clients) {
                    try {
                        client.send(payload)
                    } catch { }
                }
            }
        })

        ws.addEventListener('close', () => {
            this.connected = false
            this.upstream = null
        })

        ws.addEventListener('error', () => {
            this.connected = false
            this.upstream = null
        })
    }
}