// apps/web/src/components/dashboard/refresh-watchlist-button.tsx
"use client";

import { useFormStatus } from "react-dom";

export function RefreshWatchlistButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-border px-4 py-2 text-sm transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Refreshing…" : "Refresh watchlist"}
    </button>
  );
}