import * as types from './types'

export { StreamRoom } from './stream-room'

const cache = new Map<string, types.CacheEntry<unknown>>()

function cacheGet<T>(key: string): T | null {
    const entry = cache.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
        cache.delete(key)
        return null
    }
    return entry.value as T
}

function cacheSet<T>(key: string, value: T, ttlMs: number) {
    cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
    })
}

function getCorsHeaders(request: Request) {
    const origin = request.headers.get('Origin') ?? '*'

    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin',
    }
}

function json(data: unknown, request: Request, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
        headers: {
            'content-type': 'application/json; charset=utf-8',
            ...getCorsHeaders(request),
            ...(init?.headers ?? {}),
        },
        status: init?.status ?? 200,
    })
}

// --------------------- Helper for fetching from Finnhub API -------------------------
async function fetchFinnhub<T>(path: string, env: types.Env, fallback?: T): Promise<T> {
    try {
        const response = await fetch(`https://finnhub.io/api/v1/${path}`, {
            headers: {
                'X-Finnhub-Token': env.FINNHUB_API_KEY,
            },
        })

        if (response.status === 429) {
            if (fallback !== undefined) return fallback
            throw new Error(`Finnhub rate limited: ${path} (429)`)
        }

        if (!response.ok) {
            if (fallback !== undefined) return fallback
            throw new Error(`Finnhub request failed: ${path} (${response.status})`)
        }

        return (await response.json()) as T
    } catch (error) {
        if (fallback !== undefined) return fallback
        throw error
    }
}

function getSymbols(url: URL) {
    return (url.searchParams.get('symbols') ?? '')
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
}

function getSingleSymbol(url: URL) {
    return (url.searchParams.get('symbol') ?? '').trim().toUpperCase()
}

// --------------------- Helper for fetching from TwelveData API -------------------------
async function fetchTwelveData<T>(
    params: Record<string, string>,
    env: types.Env
): Promise<T> {
    const query = new URLSearchParams({
        ...params,
        apikey: env.TWELVE_DATA_API_KEY,
    })

    const response = await fetch(
        `https://api.twelvedata.com/time_series?${query.toString()}`
    )

    if (!response.ok) {
        throw new Error(`Twelve Data request failed (${response.status})`)
    }

    const data = await response.json()

    if (
        typeof data === 'object' &&
        data !== null &&
        'status' in data &&
        data.status === 'error'
    ) {
        throw new Error(
            'message' in data && typeof data.message === 'string'
                ? data.message
                : 'Twelve Data request failed'
        )
    }

    return data as T
}

export default {
    // --------------------- Actual Fetching -------------------------
    async fetch(request: Request, env: types.Env): Promise<Response> {
        try {
            if (request.method === 'OPTIONS') {
                return new Response(null, {
                    status: 204,
                    headers: getCorsHeaders(request),
                })
            }

            if (!env.FINNHUB_API_KEY) {
                return json({ error: 'Missing FINNHUB_API_KEY binding' }, request, { status: 500 })
            }

            const url = new URL(request.url)

            // --------------------- Getting the responses from the individual routes -------------------------
            // Health
            if (url.pathname === '/health') {
                return json({ ok: true }, request, { status: 200 })
            }

            // Market Status
            if (url.pathname === '/market-status') {
                const exchange = (url.searchParams.get('exchange') ?? 'US').trim().toUpperCase()
                const cacheKey = `market-status:${exchange}`
                const cached = cacheGet<{
                    exchange: string
                    holiday: string
                    isOpen: boolean
                    sessionOpen: string | null
                    sessionClose: string | null
                    timestamp: number
                }>(cacheKey)

                if (cached) {
                    return json(cached, request)
                }

                try {
                    const data = await fetchFinnhub<types.FinnhubMarketStatus>(
                        `stock/market-status?exchange=${encodeURIComponent(exchange)}`,
                        env
                    )

                    const payload = {
                        exchange: data.exchange ?? exchange,
                        holiday: data.holiday ?? '',
                        isOpen: Boolean(data.isOpen),
                        sessionOpen: data.sessionOpen ?? null,
                        sessionClose: data.sessionClose ?? null,
                        timestamp: typeof data.t === 'number' ? data.t * 1000 : Date.now(),
                    }

                    cacheSet(cacheKey, payload, 30_000)
                    return json(payload, request)
                } catch (error) {
                    return json(
                        {
                            error: 'Failed to fetch market status',
                            details: error instanceof Error ? error.message : 'Unknown error',
                        },
                        request,
                        { status: 500 }
                    )
                }
            }

            // Quotes
            if (url.pathname === '/quotes') {
                const symbols = getSymbols(url)

                if (!symbols.length) {
                    return json({ error: 'Missing symbols query param' }, request, { status: 400 })
                }

                const cacheKey = `quotes:${symbols.join(',')}`
                const cached = cacheGet<{
                    quotes: Array<{
                        symbol: string
                        price: number | null
                        change: number | null
                        percentChange: number | null
                        high: number | null
                        low: number | null
                        open: number | null
                        previousClose: number | null
                        timestamp?: number
                    }>
                }>(cacheKey)

                if (cached) {
                    return json(cached, request)
                }

                try {
                    const quotes = await Promise.all(
                        symbols.map(async (symbol) => {
                            const quote = await fetchFinnhub<types.FinnhubQuote>(
                                `quote?symbol=${encodeURIComponent(symbol)}`,
                                env,
                                {} as types.FinnhubQuote
                            )

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

                    const payload = { quotes }
                    cacheSet(cacheKey, payload, 15_000)
                    return json(payload, request)
                } catch (error) {
                    return json(
                        {
                            error: 'Failed to fetch quotes',
                            details: error instanceof Error ? error.message : 'Unknown error',
                        },
                        request,
                        { status: 500 }
                    )
                }
            }

            // Profiles
            if (url.pathname === '/profiles') {
                const symbols = getSymbols(url)

                if (!symbols.length) {
                    return json({ error: 'Missing symbols query param' }, request, { status: 400 })
                }

                const cacheKey = `profiles:${symbols.join(',')}`
                const cached = cacheGet<{ profiles: Array<Record<string, unknown>> }>(cacheKey)

                if (cached) {
                    return json(cached, request)
                }

                try {
                    const profiles = await Promise.all(
                        symbols.map(async (symbol) => {
                            const profile = await fetchFinnhub<types.FinnhubProfile>(
                                `stock/profile2?symbol=${encodeURIComponent(symbol)}`,
                                env,
                                {} as types.FinnhubProfile
                            )

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

                    const payload = { profiles }
                    cacheSet(cacheKey, payload, 24 * 60 * 60 * 1000)
                    return json(payload, request)
                } catch {
                    return json({ error: 'Failed to fetch company profiles' }, request, { status: 500 })
                }
            }

            // News
            if (url.pathname === '/news') {                
                const symbol = getSingleSymbol(url)

                if (!symbol) {
                    return json({ error: 'Missing symbol query param' }, request, { status: 400 })
                }

                const cacheKey = `news:${symbol}`
                const cached = cacheGet<{ symbol: string; news: types.FinnhubNewsItem[] }>(cacheKey)
                if (cached) return json(cached, request)

                const today = new Date()
                const from = new Date(today)
                from.setDate(today.getDate() - 7)

                const toDate = today.toISOString().slice(0, 10)
                const fromDate = from.toISOString().slice(0, 10)

                try {
                    const newsData = await fetchFinnhub<types.FinnhubNewsItem[]>(
                        `company-news?symbol=${encodeURIComponent(symbol)}&from=${fromDate}&to=${toDate}`,
                        env,
                        []
                    )

                    const payload = {
                        symbol,
                        news: Array.isArray(newsData)
                            ? newsData.slice(0, 12).map((item) => ({
                                id: item.id,
                                category: item.category ?? '',
                                datetime: item.datetime ?? null,
                                headline: item.headline ?? '',
                                related: item.related ?? '',
                                source: item.source ?? '',
                                summary: item.summary ?? '',
                                url: item.url ?? '',
                            }))
                            : [],
                    }
                    cacheSet(cacheKey, payload, 120_000)
                    return json(payload, request)
                } catch (error) {
                    return json(
                        {
                            error: 'Failed to fetch news',
                            details: error instanceof Error ? error.message : 'Unknown error',
                        },
                        request,
                        { status: 500 }
                    )
                }
            }

            // Financials
            if (url.pathname === '/financials') {
                const symbol = getSingleSymbol(url)

                if (!symbol) {
                    return json({ error: 'Missing symbol query param' }, request, { status: 400 })
                }

                const cacheKey = `financials:${symbol}`
                const cached = cacheGet<{
                    symbol: string
                    basicFinancials: types.FinnhubFinancialsResponse
                    financialsReported: types.FinnhubFinancialsReportedResponse
                }>(cacheKey)
                if (cached) return json(cached, request)

                try {
                    const [basicFinancials, financialsReported] = await Promise.all([
                        fetchFinnhub<types.FinnhubFinancialsResponse>(
                            `stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all`,
                            env,
                            { metric: {} }
                        ),
                        fetchFinnhub<types.FinnhubFinancialsReportedResponse>(
                            `stock/financials-reported?symbol=${encodeURIComponent(symbol)}`,
                            env,
                            { data: [] }
                        ),
                    ])

                    const payload = {
                        symbol,
                        basicFinancials,
                        financialsReported,
                    }

                    cacheSet(cacheKey, payload, 6 * 60 * 60 * 1000)
                    return json(payload, request)
                } catch (error) {
                    return json(
                        {
                            error: 'Failed to fetch financials',
                            details: error instanceof Error ? error.message : 'Unknown error',
                        },
                        request,
                        { status: 500 }
                    )
                }
            }

            // Recommendations
            if (url.pathname === '/recommendations') {
                const symbol = getSingleSymbol(url)

                if (!symbol) {
                    return json({ error: 'Missing symbol query param' }, request, { status: 400 })
                }

                const cacheKey = `recommendations:${symbol}`
                const cached = cacheGet<{
                    symbol: string
                    recommendations: types.FinnhubRecommendationTrendItem[]
                }>(cacheKey)
                if (cached) return json(cached, request)

                try {
                    const recommendations = await fetchFinnhub<types.FinnhubRecommendationTrendItem[]>(
                        `stock/recommendation?symbol=${encodeURIComponent(symbol)}`,
                        env,
                        []
                    )

                    const payload = {
                        symbol,
                        recommendations: Array.isArray(recommendations) ? recommendations : [],
                    }

                    cacheSet(cacheKey, payload, 60 * 60 * 1000)
                    return json(payload, request)
                } catch (error) {
                    return json(
                        {
                            error: 'Failed to fetch recommendations',
                            details: error instanceof Error ? error.message : 'Unknown error',
                        },
                        request,
                        { status: 500 }
                    )
                }
            }

            // Assets
            if (url.pathname === '/asset') {
                const symbol = getSingleSymbol(url)

                if (!symbol) {
                    return json({ error: 'Missing symbol query param' }, request, { status: 400 })
                }

                const today = new Date()
                const from = new Date(today)
                from.setDate(today.getDate() - 7)

                const toDate = today.toISOString().slice(0, 10)
                const fromDate = from.toISOString().slice(0, 10)
                const encodedSymbol = encodeURIComponent(symbol)

                try {
                    const [
                        profile,
                        quote,
                        news,
                        basicFinancials,
                        financialsReported,
                        recommendations,
                    ] = await Promise.all([
                        fetchFinnhub(`stock/profile2?symbol=${encodedSymbol}`, env, {}),
                        fetchFinnhub(`quote?symbol=${encodedSymbol}`, env, {}),
                        fetchFinnhub(
                            `company-news?symbol=${encodedSymbol}&from=${fromDate}&to=${toDate}`,
                            env,
                            [] as unknown[]
                        ),
                        fetchFinnhub(`stock/metric?symbol=${encodedSymbol}&metric=all`, env, { metric: {} }),
                        fetchFinnhub(`stock/financials-reported?symbol=${encodedSymbol}`, env, { data: [] }),
                        fetchFinnhub(`stock/recommendation?symbol=${encodedSymbol}`, env, [] as unknown[]),
                    ])

                    return json({
                        symbol,
                        profile,
                        quote,
                        news: Array.isArray(news) ? news : [],
                        basicFinancials,
                        financialsReported,
                        recommendations: Array.isArray(recommendations) ? recommendations : [],
                    }, request)
                } catch {
                    return json({ error: 'Failed to fetch asset details' }, request, { status: 500 })
                }
            }

            // Search
            if (url.pathname === '/search') {
                const q = (url.searchParams.get('q') ?? '').trim()

                if (!q) {
                    return json(
                        {
                            query: '',
                            assets: [],
                            news: [],
                        },
                        request
                    )
                }

                const cacheKey = `search:${q.toLowerCase()}`
                const cached = cacheGet<{
                    query: string
                    assets: Array<Record<string, unknown>>
                    news: Array<Record<string, unknown>>
                    topSymbol: string | null
                }>(cacheKey)
                if (cached) return json(cached, request)

                try {
                    const searchData = await fetchFinnhub<types.FinnhubSearchResponse>(
                        `search?q=${encodeURIComponent(q)}`,
                        env,
                        { result: [] }
                    )

                    const rawResults = Array.isArray(searchData.result) ? searchData.result : []

                    const assets = rawResults.slice(0, 8).map((item) => ({
                        description: item.description ?? '',
                        displaySymbol: item.displaySymbol ?? item.symbol ?? '',
                        symbol: item.symbol ?? '',
                        type: item.type ?? '',
                    }))

                    const topSymbol = assets[0]?.symbol
                    let news: types.FinnhubNewsItem[] = []

                    if (topSymbol) {
                        const today = new Date()
                        const from = new Date(today)
                        from.setDate(today.getDate() - 7)

                        const toDate = today.toISOString().slice(0, 10)
                        const fromDate = from.toISOString().slice(0, 10)

                        const newsData = await fetchFinnhub<types.FinnhubNewsItem[]>(
                            `company-news?symbol=${encodeURIComponent(topSymbol)}&from=${fromDate}&to=${toDate}`,
                            env,
                            []
                        )

                        news = Array.isArray(newsData)
                            ? newsData.slice(0, 6).map((item) => ({
                                id: item.id,
                                category: item.category ?? '',
                                datetime: item.datetime ?? null,
                                headline: item.headline ?? '',
                                related: item.related ?? '',
                                source: item.source ?? '',
                                summary: item.summary ?? '',
                                url: item.url ?? '',
                            }))
                            : []
                    }

                    const payload = {
                        query: q,
                        assets,
                        news,
                        topSymbol: topSymbol ?? null,
                    }

                    cacheSet(cacheKey, payload, 30_000)
                    return json(payload, request)
                } catch {
                    return json({ error: 'Failed to search assets' }, request, { status: 500 })
                }
            }

            // Websocket
            if (url.pathname === '/ws') {
                const symbols = getSymbols(url).sort()

                if (!symbols.length) {
                    return json({ error: 'Missing symbols query param' }, request, { status: 400 })
                }

                if (request.headers.get('Upgrade') !== 'websocket') {
                    return new Response('Expected Upgrade: websocket', { status: 426 })
                }

                const roomKey = symbols.join(',')
                const id = env.STREAM_ROOM.idFromName(roomKey)
                const stub = env.STREAM_ROOM.get(id)

                return stub.fetch(request)
            }
            
            // ------------------------------------ TwelveData -------------------------------------
            // Historical
            if (url.pathname === '/historical') {
                const symbol = getSingleSymbol(url)
                const range = (url.searchParams.get('range') ?? '1Y').toUpperCase()

                if (!symbol) {
                    return json(
                        { error: 'Missing symbol query param' },
                        request,
                        { status: 400 }
                    )
                }

                const ranges: Record<string, {
                    interval: '1day' | '1week'
                    outputsize: number
                }> = {
                    '1M': {
                        interval: '1day',
                        outputsize: 30,
                    },
                    '6M': {
                        interval: '1day',
                        outputsize: 180,
                    },
                    '1Y': {
                        interval: '1day',
                        outputsize: 365,
                    },
                    '5Y': {
                        interval: '1day',
                        outputsize: 1305,
                    },
                    MAX: {
                        interval: '1week',
                        outputsize: 5000,
                    },
                }

                const config = ranges[range]

                if (!config) {
                    return json(
                        {
                            error: 'Invalid range',
                            supportedRanges: Object.keys(ranges),
                        },
                        request,
                        { status: 400 }
                    )
                }

                const cacheKey = `historical:${symbol}:${range}`

                const cached = cacheGet<{
                    symbol: string
                    range: string
                    interval: string
                    data: types.HistoricalCandle[]
                }>(cacheKey)

                if (cached) {
                    return json(cached, request)
                }

                try {
                    const data = await fetchTwelveData<{
                        values?: Array<{
                            datetime: string
                            open: string
                            high: string
                            low: string
                            close: string
                            volume?: string
                        }>
                    }>(
                        {
                            symbol,
                            interval: config.interval,
                            outputsize: String(config.outputsize),
                            order: 'asc',
                        },
                        env
                    )

                    const candles: types.HistoricalCandle[] = (data.values ?? [])
                        .map((item) => ({
                            timestamp: Math.floor(
                                new Date(item.datetime).getTime() / 1000
                            ),
                            open: Number(item.open),
                            high: Number(item.high),
                            low: Number(item.low),
                            close: Number(item.close),
                            volume: item.volume ? Number(item.volume) : null,
                        }))
                        .filter(
                            (item) =>
                                Number.isFinite(item.timestamp) &&
                                Number.isFinite(item.open) &&
                                Number.isFinite(item.high) &&
                                Number.isFinite(item.low) &&
                                Number.isFinite(item.close)
                        )

                    const payload = {
                        symbol,
                        range,
                        interval: config.interval,
                        data: candles,
                    }

                    cacheSet(cacheKey, payload, 60 * 60 * 1000)

                    return json(payload, request)
                } catch (error) {
                    return json(
                        {
                            error: 'Failed to fetch historical data',
                            details:
                                error instanceof Error
                                    ? error.message
                                    : 'Unknown error',
                        },
                        request,
                        { status: 500 }
                    )
                }
            }

            return json({ error: 'Not found' }, request, { status: 404 })
        } catch (error) {
            return json(
                {
                    error: 'Internal server error',
                    details: error instanceof Error ? error.message : 'Unknown error',
                },
                request,
                { status: 500 }
            )
        }
    },
}