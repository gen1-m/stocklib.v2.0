'use client'

import { useLiveTickers } from './live-ticker-provider'

export function TrackingUpdateControls() {
  const {
    hasPendingUpdates,
    pendingUpdateCount,
    applyPendingUpdates,
  } = useLiveTickers()

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Tracking snapshot</p>
        <p className="text-sm text-muted-foreground">
          {hasPendingUpdates
            ? `${pendingUpdateCount} live update${pendingUpdateCount === 1 ? '' : 's'} available`
            : 'Showing latest API data'}
        </p>
      </div>

      <button
        type="button"
        onClick={applyPendingUpdates}
        disabled={!hasPendingUpdates}
        className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        Apply live updates
      </button>
    </div>
  )
}