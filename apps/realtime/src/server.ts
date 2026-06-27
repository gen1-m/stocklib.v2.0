import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import cors from 'cors'
import express from 'express'
import { FinnhubStream } from './finnhub.ts'
import type { TickerUpdate } from './types.ts'

const port = Number(process.env.PORT ?? 4001)
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000'
const apiKey = process.env.FINNHUB_API_KEY

if (!apiKey) {
  throw new Error('Missing FINNHUB_API_KEY')
}

const app = express()
app.use(cors({ origin: corsOrigin }))

const finnhub = new FinnhubStream(apiKey)
finnhub.connect()


type Client = {
  id: string
  symbols: Set<string>
  res: express.Response
}

const clients = new Map<string, Client>()

function sendSse(res: express.Response, event: string, data: unknown) {
  res.write(`event: ${event}\n`)
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, clients: clients.size })
})

app.get('/stream', (req, res) => {
  const symbolsParam = String(req.query.symbols ?? '')
  const symbols = symbolsParam
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)

  if (!symbols.length) {
    return res.status(400).json({ error: 'Missing symbols query param' })
  }

  for (const symbol of symbols) {
    finnhub.subscribe(symbol)
  }

  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  res.write('retry: 5000\n\n')

  const id = randomUUID()
  const client: Client = {
    id,
    symbols: new Set(symbols),
    res,
  }

  clients.set(id, client)

  sendSse(res, 'ready', { symbols })

  const heartbeat = setInterval(() => {
    res.write(': keep-alive\n\n')
  }, 15000)

  req.on('close', () => {
    clearInterval(heartbeat)
    clients.delete(id)
    res.end()
  })
  console.log('[sse] client connected for symbols:', symbols)
})

app.get('/market-status', async (req, res) => {
  const exchange = String(req.query.exchange ?? 'US').toUpperCase()

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/market-status?exchange=${encodeURIComponent(exchange)}`,
      {
        headers: {
          'X-Finnhub-Token': apiKey,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Market status request failed for ${exchange}`)
    }

    const data = await response.json()

    res.json({
      exchange: data.exchange ?? exchange,
      holiday: data.holiday ?? '',
      isOpen: Boolean(data.isOpen),
      sessionOpen: data.sessionOpen ?? null,
      sessionClose: data.sessionClose ?? null,
      timestamp: typeof data.t === 'number' ? data.t * 1000 : Date.now(),
    })
  } catch (error) {
    console.error('[market-status] failed to fetch market status', error)
    res.status(500).json({ error: 'Failed to fetch market status' })
  }
})

app.get('/quotes', async (req, res) => {
  const symbolsParam = String(req.query.symbols ?? '')
  const symbols = symbolsParam
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)

  if (!symbols.length) {
    return res.status(400).json({ error: 'Missing symbols query param' })
  }

  try {
    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}`,
          {
            headers: {
              'X-Finnhub-Token': apiKey,
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Quote request failed for ${symbol}`)
        }

        const quote = await response.json()

        return {
          symbol,
          price: typeof quote.c === 'number' ? quote.c : null,
          change: typeof quote.d === 'number' ? quote.d : null,
          percentChange: typeof quote.dp === 'number' ? quote.dp : null,
          high: typeof quote.h === 'number' ? quote.h : null,
          low: typeof quote.l === 'number' ? quote.l : null,
          open: typeof quote.o === 'number' ? quote.o : null,
          previousClose: typeof quote.pc === 'number' ? quote.pc : null,
          timestamp: typeof quote.t === 'number' ? quote.t * 1000 : undefined,
        }
      })
    )

    res.json({ quotes })
  } catch (error) {
    console.error('[quotes] failed to fetch initial quotes', error)
    res.status(500).json({ error: 'Failed to fetch quotes' })
  }
})

app.get('/profiles', async (req, res) => {
  const symbolsParam = String(req.query.symbols ?? '')
  const symbols = symbolsParam
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)

  if (!symbols.length) {
    return res.status(400).json({ error: 'Missing symbols query param' })
  }

  try {
    const profiles = await Promise.all(
      symbols.map(async (symbol) => {
        const response = await fetch(
          `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}`,
          {
            headers: {
              'X-Finnhub-Token': apiKey,
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Profile request failed for ${symbol}`)
        }

        const profile = await response.json()

        return {
          symbol,
          name: profile.name ?? symbol,
          ticker: profile.ticker ?? symbol,
          currency: profile.currency ?? null,
          exchange: profile.exchange ?? null,
          finnhubIndustry: profile.finnhubIndustry ?? null,
          logo: profile.logo ?? null,
          marketCapitalization:
            typeof profile.marketCapitalization === 'number'
              ? profile.marketCapitalization
              : null,
          country: profile.country ?? null,
          ipo: profile.ipo ?? null,
          weburl: profile.weburl ?? null,
        }
      })
    )

    res.json({ profiles })
  } catch (error) {
    console.error('[profiles] failed to fetch company profiles', error)
    res.status(500).json({ error: 'Failed to fetch company profiles' })
  }
})

finnhub.onUpdate((update: TickerUpdate) => {
  for (const client of clients.values()) {
    if (!client.symbols.has(update.symbol)) continue

    try {
      sendSse(client.res, 'ticker', update)
      console.log('[sse] broadcasting update:', update)
    } catch {
      clients.delete(client.id)
      client.res.end()
    }
  }
})

app.listen(port, () => {
  console.log(`Realtime service listening on http://localhost:${port}`)
})