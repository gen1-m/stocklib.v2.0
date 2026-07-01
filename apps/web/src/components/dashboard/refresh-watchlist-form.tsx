"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { refreshWatchlistData } from "@/app/dashboard/actions";
import {
  initialRefreshWatchlistState,
  type RefreshWatchlistState,
} from "@/app/dashboard/refresh-watchlist-state";

function RefreshWatchlistButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Refreshing…" : "Refresh watchlist"}
    </button>
  );
}

function SuccessIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-5 w-5 text-emerald-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="10" cy="10" r="7.25" />
      <path d="M6.5 10.2l2.3 2.3 4.7-5.1" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-5 w-5 text-red-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 6.2v4.6" />
      <path d="M10 13.8h.01" />
    </svg>
  );
}

function ToastCard({
  state,
  visible,
  onClose,
}: {
  state: RefreshWatchlistState;
  visible: boolean;
  onClose: () => void;
}) {
  const isSuccess = state.status === "success";

  return (
    <div
      className={[
        "pointer-events-auto relative w-[min(92vw,24rem)] overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl",
        "transition-all duration-300 ease-out",
        visible
          ? "translate-y-0 opacity-100 sm:translate-x-0"
          : "translate-y-2 opacity-0 sm:translate-x-2 sm:translate-y-0",
        isSuccess
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-50"
          : "border-red-500/20 bg-red-500/10 text-red-50",
      ].join(" ")}
      aria-hidden={!visible}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
        aria-label="Close notification"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M5 5l10 10M15 5L5 15" />
        </svg>
      </button>

      <div className="flex gap-3 px-4 py-4 pr-12">
        <div className="shrink-0 pt-0.5">{isSuccess ? <SuccessIcon /> : <ErrorIcon />}</div>

        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="min-w-0 flex-1"
        >
          <p className="text-sm font-semibold">
            {isSuccess ? "Watchlist updated" : "Refresh failed"}
          </p>
          <p className="mt-1 text-sm text-white/85">{state.message}</p>
        </div>
      </div>
    </div>
  );
}

export function RefreshWatchlistForm() {
  const [state, formAction, pending] = useActionState(
    refreshWatchlistData,
    initialRefreshWatchlistState
  );
  const [dismissedTimestamp, setDismissedTimestamp] = useState<number | null>(null);

  const hasToast = state.status !== "idle" && Boolean(state.timestamp);

  const isVisible = useMemo(() => {
    if (!hasToast) return false;
    if (dismissedTimestamp === state.timestamp) return false;
    return true;
  }, [hasToast, dismissedTimestamp, state.timestamp]);

  useEffect(() => {
    if (!isVisible) return;

    const timeout = window.setTimeout(() => {
      setDismissedTimestamp(state.timestamp);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [isVisible, state.timestamp]);

  return (
    <>
      <form action={formAction}>
        <RefreshWatchlistButton pending={pending} />
      </form>

      {hasToast ? (
        <div className="pointer-events-none fixed bottom-4 right-4 z-100 sm:bottom-6 sm:right-6">
          <ToastCard
            state={state}
            visible={isVisible}
            onClose={() => setDismissedTimestamp(state.timestamp)}
          />
        </div>
      ) : null}
    </>
  );
}