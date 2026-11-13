'use client'

import { useEffect, useRef, useState } from 'react'
import {
    createChart,
    ColorType,
    AreaSeries,
    type IChartApi,
    type ISeriesApi,
    type UTCTimestamp,
} from 'lightweight-charts'

type Range = '1M' | '6M' | '1Y' | '5Y' | 'MAX'

type HistoricalCandle = {
    timestamp: number
    open: number
    high: number
    low: number
    close: number
    volume: number | null
}

type HistoricalResponse = {
    symbol: string
    range: string
    interval: string
    data: HistoricalCandle[]
}

type Props = {
    symbol: string
}

const ranges: Range[] = ['1M', '6M', '1Y', '5Y', 'MAX']

const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

export default function HistoricalPriceChart({ symbol }: Props) {
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)

    const [range, setRange] = useState<Range>('1Y')
    const [loading, setLoading] = useState(true)

    // Create chart once
    useEffect(() => {
        if (!chartContainerRef.current) return

        const chart = createChart(chartContainerRef.current, {
            height: 400,

            layout: {
                textColor: '#9ca3af',
                background: {
                    type: ColorType.Solid,
                    color: 'transparent',
                },
            },

            localization: {
                priceFormatter: (price: number) =>
                    usdFormatter.format(price),
            },

            grid: {
                vertLines: {
                    visible: false,
                },
                horzLines: {
                    color: '#27272a',
                },
            },

            rightPriceScale: {
                borderVisible: false,
                scaleMargins: {
                    top: 0.15,
                    bottom: 0.15,
                },
                mode: 0,
            },

            timeScale: {
                borderVisible: false,
                timeVisible: false,
                rightOffset: 10,
                barSpacing: 6,
            },

            crosshair: {
                vertLine: {
                    labelVisible: true,
                },
                horzLine: {
                    labelVisible: true,
                },
            },
        })

        const series = chart.addSeries(AreaSeries, {
            lineWidth: 2,

            topColor: 'rgba(59, 130, 246, 0.25)',
            bottomColor: 'rgba(59, 130, 246, 0.00)',
            lineColor: '#3b82f6',

            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },

            priceLineVisible: true,
            lastValueVisible: true,
        })

        chartRef.current = chart
        seriesRef.current = series

        const resizeObserver = new ResizeObserver(() => {
            if (!chartContainerRef.current) return

            chart.applyOptions({
                width: chartContainerRef.current.clientWidth,
            })
        })

        resizeObserver.observe(chartContainerRef.current)

        return () => {
            resizeObserver.disconnect()
            chart.remove()

            chartRef.current = null
            seriesRef.current = null
        }
    }, [])

    // Fetch data whenever symbol or range changes
    useEffect(() => {
        const fetchHistoricalData = async () => {
            if (!chartRef.current || !seriesRef.current) return

            setLoading(true)

            try {
                const baseUrl =
                    process.env.NEXT_PUBLIC_REALTIME_URL

                const response = await fetch(
                    `${baseUrl}/historical?symbol=${encodeURIComponent(
                        symbol
                    )}&range=${range}`
                )

                if (!response.ok) {
                    throw new Error(
                        'Failed to fetch historical data'
                    )
                }

                const result: HistoricalResponse =
                    await response.json()

                const data = result.data.map((item) => ({
                    time: item.timestamp as UTCTimestamp,
                    value: item.close,
                }))

                // Replace the existing data
                seriesRef.current.setData(data)

                // Fit the chart to the new range
                chartRef.current.timeScale().fitContent()

                const prices = result.data.map((item) => item.close)

                const minPrice = Math.min(...prices)
                const maxPrice = Math.max(...prices)

                const padding = (maxPrice - minPrice) * 0.1

                chartRef.current.priceScale('right').setVisibleRange({
                    from: Math.max(0, minPrice - padding),
                    to: maxPrice + padding,
                })
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchHistoricalData()
    }, [symbol, range])

    return (
        <div>
            {/* Range selector */}
            <div className="mb-4 flex gap-2">
                {ranges.map((item) => (
                    <button
                        key={item}
                        onClick={() => setRange(item)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${range === item
                            ? 'bg-white text-black shadow-sm'
                            : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
                            }`}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="relative rounded-xl border border-white/5 bg-white/2 ">
                {loading && (
                    <div className="flex items-center justify-center max-w-fit">
                        <span className="text-sm text-gray-400">
                            Loading...
                        </span>
                    </div>
                )}

                <div
                    ref={chartContainerRef}
                    className="w-full"
                />
            </div>
        </div>
    )
}