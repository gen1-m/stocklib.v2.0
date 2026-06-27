import Link from 'next/link'
import Image from 'next/image'
import type { AssetDetailsResponse } from '../asset-types'

type PageProps = {
    params: Promise<{
        symbol: string
    }>
}

function formatNumber(value?: number | null) {
    if (value === null || value === undefined) return '—'
    return value.toLocaleString()
}

function formatPrice(value?: number | null, currency?: string) {
    if (value === null || value === undefined) return '—'
    return `${value.toFixed(2)}${currency ? ` ${currency}` : ''}`
}

function formatDate(value?: string | number) {
    if (!value) return '—'

    const date =
        typeof value === 'number' ? new Date(value * 1000) : new Date(value)

    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString()
}

function formatDateTime(value?: number) {
    if (!value) return '—'
    return new Date(value * 1000).toLocaleString()
}

async function getAssetDetails(symbol: string): Promise<AssetDetailsResponse> {
    const realtimeBase = process.env.NEXT_PUBLIC_REALTIME_URL

    if (!realtimeBase) {
        throw new Error('Missing NEXT_PUBLIC_REALTIME_URL')
    }

    const response = await fetch(
        `${realtimeBase}/asset?symbol=${encodeURIComponent(symbol)}`,
        { cache: 'no-store' }
    )

    if (!response.ok) {
        throw new Error(`Failed to fetch asset details for ${symbol}`)
    }

    return response.json()
}

export default async function AssetDetailPage({ params }: PageProps) {
    const { symbol } = await params
    const asset = await getAssetDetails(symbol.toUpperCase())

    const profile = asset.profile
    const quote = asset.quote
    const metrics = asset.basicFinancials?.metric ?? {}
    const latestRecommendation = asset.recommendations?.[0]
    const latestReport = asset.financialsReported?.data?.[0]

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <Link href="/dashboard/tracking" className="hover:underline">
                    Tracking
                </Link>
                <span>/</span>
                <span>{asset.symbol}</span>
            </div>

            <section className="rounded-2xl border p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 space-y-3">
                        <div>
                            <h1 className="text-3xl font-semibold">
                                {profile.name ?? asset.symbol}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {profile.ticker ?? asset.symbol}
                                {profile.exchange ? ` · ${profile.exchange}` : ''}
                                {profile.currency ? ` · ${profile.currency}` : ''}
                                {profile.finnhubIndustry ? ` · ${profile.finnhubIndustry}` : ''}
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl bg-muted/30 p-4">
                                <div className="text-xs text-muted-foreground">Current price</div>
                                <div className="mt-1 text-lg font-medium">
                                    {formatPrice(quote.c, profile.currency)}
                                </div>
                            </div>

                            <div className="rounded-xl bg-muted/30 p-4">
                                <div className="text-xs text-muted-foreground">Day change</div>
                                <div className="mt-1 text-lg font-medium">
                                    {quote.d !== undefined ? `${quote.d.toFixed(2)} (${quote.dp?.toFixed(2) ?? '—'}%)` : '—'}
                                </div>
                            </div>

                            <div className="rounded-xl bg-muted/30 p-4">
                                <div className="text-xs text-muted-foreground">Market cap</div>
                                <div className="mt-1 text-lg font-medium">
                                    {formatNumber(profile.marketCapitalization)}
                                </div>
                            </div>

                            <div className="rounded-xl bg-muted/30 p-4">
                                <div className="text-xs text-muted-foreground">IPO date</div>
                                <div className="mt-1 text-lg font-medium">
                                    {formatDate(profile.ipo)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {profile.logo ? (
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl border">
                            <Image
                                src={profile.logo}
                                alt={`${profile.name ?? asset.symbol} logo`}
                                fill
                                className="object-contain p-2"
                                sizes="64px"
                            />
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border p-6">
                    <h2 className="text-xl font-semibold">Basic financials</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-muted/30 p-4">
                            <div className="text-xs text-muted-foreground">52 week high</div>
                            <div className="mt-1 font-medium">
                                {formatPrice(
                                    typeof metrics['52WeekHigh'] === 'number' ? metrics['52WeekHigh'] : null,
                                    profile.currency
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl bg-muted/30 p-4">
                            <div className="text-xs text-muted-foreground">52 week low</div>
                            <div className="mt-1 font-medium">
                                {formatPrice(
                                    typeof metrics['52WeekLow'] === 'number' ? metrics['52WeekLow'] : null,
                                    profile.currency
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl bg-muted/30 p-4">
                            <div className="text-xs text-muted-foreground">P/E ratio</div>
                            <div className="mt-1 font-medium">
                                {formatNumber(
                                    typeof metrics['peNormalizedAnnual'] === 'number'
                                        ? metrics['peNormalizedAnnual']
                                        : null
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl bg-muted/30 p-4">
                            <div className="text-xs text-muted-foreground">Dividend yield</div>
                            <div className="mt-1 font-medium">
                                {formatNumber(
                                    typeof metrics['dividendYieldIndicatedAnnual'] === 'number'
                                        ? metrics['dividendYieldIndicatedAnnual']
                                        : null
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border p-6">
                    <h2 className="text-xl font-semibold">Recommendation trends</h2>
                    {latestRecommendation ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl bg-muted/30 p-4">
                                <div className="text-xs text-muted-foreground">Strong buy</div>
                                <div className="mt-1 font-medium">
                                    {formatNumber(latestRecommendation.strongBuy)}
                                </div>
                            </div>

                            <div className="rounded-xl bg-muted/30 p-4">
                                <div className="text-xs text-muted-foreground">Buy</div>
                                <div className="mt-1 font-medium">
                                    {formatNumber(latestRecommendation.buy)}
                                </div>
                            </div>

                            <div className="rounded-xl bg-muted/30 p-4">
                                <div className="text-xs text-muted-foreground">Hold</div>
                                <div className="mt-1 font-medium">
                                    {formatNumber(latestRecommendation.hold)}
                                </div>
                            </div>

                            <div className="rounded-xl bg-muted/30 p-4">
                                <div className="text-xs text-muted-foreground">Sell</div>
                                <div className="mt-1 font-medium">
                                    {formatNumber(latestRecommendation.sell)}
                                </div>
                            </div>

                            <div className="rounded-xl bg-muted/30 p-4">
                                <div className="text-xs text-muted-foreground">Strong sell</div>
                                <div className="mt-1 font-medium">
                                    {formatNumber(latestRecommendation.strongSell)}
                                </div>
                            </div>

                            <div className="rounded-xl bg-muted/30 p-4">
                                <div className="text-xs text-muted-foreground">Period</div>
                                <div className="mt-1 font-medium">
                                    {latestRecommendation.period ?? '—'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-muted-foreground">
                            No recommendation trend data available.
                        </p>
                    )}
                </div>
            </section>

            <section className="rounded-2xl border p-6">
                <h2 className="text-xl font-semibold">Financials as reported</h2>
                {latestReport ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl bg-muted/30 p-4">
                            <div className="text-xs text-muted-foreground">Form</div>
                            <div className="mt-1 font-medium">{latestReport.form ?? '—'}</div>
                        </div>

                        <div className="rounded-xl bg-muted/30 p-4">
                            <div className="text-xs text-muted-foreground">Fiscal year</div>
                            <div className="mt-1 font-medium">
                                {formatNumber(latestReport.year)}
                            </div>
                        </div>

                        <div className="rounded-xl bg-muted/30 p-4">
                            <div className="text-xs text-muted-foreground">Quarter</div>
                            <div className="mt-1 font-medium">
                                {formatNumber(latestReport.quarter)}
                            </div>
                        </div>

                        <div className="rounded-xl bg-muted/30 p-4">
                            <div className="text-xs text-muted-foreground">Accepted</div>
                            <div className="mt-1 font-medium">
                                {formatDate(latestReport.acceptedDate)}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                        No reported financial filings available.
                    </p>
                )}
            </section>

            <section className="rounded-2xl border p-6">
                <h2 className="text-xl font-semibold">Company news</h2>
                {asset.news?.length ? (
                    <div className="mt-4 grid gap-4">
                        {asset.news.slice(0, 8).map((item) => (
                            <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-xl border p-4 transition hover:bg-muted/20"
                            >
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span>{item.source ?? 'Unknown source'}</span>
                                    <span>·</span>
                                    <span>{formatDateTime(item.datetime)}</span>
                                </div>

                                <h3 className="mt-2 font-medium">{item.headline ?? 'Untitled article'}</h3>

                                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                                    {item.summary ?? 'No summary available.'}
                                </p>
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                        No recent company news available.
                    </p>
                )}
            </section>
        </div>
    )
}