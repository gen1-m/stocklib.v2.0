'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type SearchAsset = {
  description: string
  displaySymbol: string
  symbol: string
  type: string
}

type SearchNewsItem = {
  id: number
  category: string
  datetime: number | null
  headline: string
  related: string
  source: string
  summary: string
  url: string
}

type SearchResponse = {
  query: string
  assets: SearchAsset[]
  news: SearchNewsItem[]
  topSymbol: string | null
}

type TopbarProps = {
  userEmail?: string | null
}

export function Topbar({ userEmail }: TopbarProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const trimmedQuery = query.trim()
  const hasQuery = trimmedQuery.length > 0
  const showDropdown = isFocused && hasQuery

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!hasQuery) {
      return
    }

    const controller = new AbortController()

    const timeout = window.setTimeout(async () => {
      try {
        setIsLoading(true)

        const realtimeBase = process.env.NEXT_PUBLIC_REALTIME_URL

        if (!realtimeBase) {
          throw new Error('Missing NEXT_PUBLIC_REALTIME_URL')
        }

        const response = await fetch(
          `${realtimeBase}/search?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error('Search request failed')
        }

        const data: SearchResponse = await response.json()
        setResults(data)
      } catch (error) {
        if ((error as Error).name === 'AbortError') return

        console.error('[topbar-search] failed', error)
        setResults({
          query: trimmedQuery,
          assets: [],
          news: [],
          topSymbol: null,
        })
      } finally {
        setIsLoading(false)
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [hasQuery, trimmedQuery])

  function handleAssetSelect(symbol: string) {
    setQuery('')
    setResults(null)
    setIsFocused(false)
    router.push(`/dashboard/tracking/${encodeURIComponent(symbol)}`)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (results?.assets?.length) {
      handleAssetSelect(results.assets[0].symbol)
    }
  }

  async function handleSignOut() {
    try {
      setIsSigningOut(true)

      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('[auth] sign out failed', error)
        return
      }

      router.push('/auth/sign-in')
      router.refresh()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="border-b border-border bg-background/80 px-4 py-4 backdrop-blur-xl md:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Dashboard</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Overview</h2>
          {userEmail ? (
            <p className="mt-1 text-sm text-muted">{userEmail}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div ref={containerRef} className="relative hidden w-104 md:block">
            <form onSubmit={handleSubmit}>
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  const next = event.target.value
                  setQuery(next)

                  if (!next.trim()) {
                    setResults(null)
                  }
                }}
                onFocus={() => setIsFocused(true)}
                placeholder="Search by name of the stock, crypto, forex..."
                className="w-full rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary"
              />
            </form>

            {showDropdown && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-2xl border border-border bg-background p-3 shadow-2xl">
                {isLoading ? (
                  <p className="px-2 py-3 text-sm text-muted">Searching…</p>
                ) : results && (results.assets.length || results.news.length) ? (
                  <div className="space-y-4">
                    {!!results.assets.length && (
                      <section>
                        <p className="px-2 pb-2 text-xs uppercase tracking-[0.18em] text-muted">
                          Assets
                        </p>
                        <div className="space-y-1">
                          {results.assets.slice(0, 6).map((asset) => (
                            <button
                              key={`${asset.symbol}-${asset.displaySymbol}`}
                              type="button"
                              onClick={() => handleAssetSelect(asset.symbol)}
                              className="w-full rounded-xl px-3 py-3 text-left transition hover:bg-surface"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">
                                    {asset.description || asset.symbol}
                                  </p>
                                  <p className="truncate text-xs text-muted">
                                    {asset.displaySymbol || asset.symbol}
                                  </p>
                                </div>
                                <span className="shrink-0 text-xs text-muted">
                                  {asset.type || 'Asset'}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </section>
                    )}

                    {!!results.news.length && (
                      <section>
                        <p className="px-2 pb-2 text-xs uppercase tracking-[0.18em] text-muted">
                          Related news
                        </p>
                        <div className="space-y-1">
                          {results.news.slice(0, 3).map((item) => (
                            <a
                              key={item.id}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-xl px-3 py-3 transition hover:bg-surface"
                            >
                              <p className="line-clamp-1 text-sm font-medium">{item.headline}</p>
                              <p className="mt-1 line-clamp-1 text-xs text-muted">
                                {item.source || 'Unknown source'}
                              </p>
                            </a>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                ) : (
                  <p className="px-2 py-3 text-sm text-muted">No matches found.</p>
                )}
              </div>
            )}
          </div>

          <Link
            href="/"
            className="rounded-full border border-border px-4 py-2 text-sm transition hover:bg-surface"
          >
            Landing page
          </Link>

          <button
            type="button"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            New alert
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="rounded-full border border-border px-4 py-2 text-sm transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </header>
  )
}