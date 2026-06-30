/* eslint-disable @typescript-eslint/no-unused-vars */
// apps/web/src/app/dashboard/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import type { RefreshWatchlistState } from "./refresh-watchlist-state";

type FinnhubProfile = {
  ticker?: string;
  name?: string;
  exchange?: string;
  country?: string;
  currency?: string;
  ipo?: string;
  logo?: string;
  finnhubIndustry?: string;
};

type FinnhubQuote = {
  c?: number;
  d?: number;
  dp?: number;
  v?: number;
};

type WatchlistSymbolRow = {
  symbol: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export async function refreshSymbols(symbols: string[]) {
  const normalizedSymbols = Array.from(
    new Set(symbols.map((symbol) => symbol?.trim().toUpperCase()).filter(Boolean))
  );

  if (!normalizedSymbols.length) {
    return { refreshedCount: 0 };
  }

  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    throw new Error("Missing FINNHUB_API_KEY on the server.");
  }

  const now = new Date().toISOString();

  const results = await Promise.all(
    normalizedSymbols.map(async (symbol) => {
      const [profile, quote] = await Promise.all([
        fetchJson<FinnhubProfile>(
          `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`
        ),
        fetchJson<FinnhubQuote>(
          `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`
        ),
      ]);

      return { symbol, profile, quote };
    })
  );

  const companiesPayload = results.map(({ symbol, profile }) => ({
    symbol,
    name: profile.name || symbol,
    exchange: profile.exchange || null,
    country: profile.country || null,
    currency: profile.currency || null,
    ipo: profile.ipo || null,
    logo_url: profile.logo || null,
    sector: null,
    industry: profile.finnhubIndustry || null,
    updated_at: now,
  }));

  const pricesPayload = results.map(({ symbol, quote }) => ({
    symbol,
    last_price: quote.c ?? null,
    change_amount: quote.d ?? null,
    change_percent: quote.dp ?? null,
    volume: quote.v ?? null,
    fetched_at: now,
  }));

  const { error: companiesError } = await adminClient
    .from("companies")
    .upsert(companiesPayload, { onConflict: "symbol" });

  if (companiesError) {
    throw new Error(companiesError.message);
  }

  const { error: pricesError } = await adminClient
    .from("price_cache")
    .upsert(pricesPayload, { onConflict: "symbol" });

  if (pricesError) {
    throw new Error(pricesError.message);
  }

  return { refreshedCount: normalizedSymbols.length };
}

export async function getDefaultWatchlistSymbolsForUser(userId: string) {
  const supabase = await createClient();

  const { data: watchlist, error } = await supabase
    .from("watchlists")
    .select(`
      id,
      watchlist_items (
        symbol
      )
    `)
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Array.from(
    new Set(
      ((watchlist?.watchlist_items ?? []) as WatchlistSymbolRow[])
        .map((item) => item.symbol?.trim().toUpperCase())
        .filter(Boolean)
    )
  );
}

export async function refreshWatchlistData(
  _prevState: RefreshWatchlistState
): Promise<RefreshWatchlistState> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        status: "error",
        message: "You must be signed in to refresh your watchlist.",
        timestamp: Date.now(),
      };
    }

    const symbols = await getDefaultWatchlistSymbolsForUser(user.id);

    if (!symbols.length) {
      revalidatePath("/dashboard");
      return {
        status: "success",
        message: "No symbols found in your default watchlist.",
        timestamp: Date.now(),
      };
    }

    const result = await refreshSymbols(symbols);

    revalidatePath("/dashboard");

    return {
      status: "success",
      message: `Refreshed ${result.refreshedCount} symbol${result.refreshedCount === 1 ? "" : "s"}.`,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Something went wrong.",
      timestamp: Date.now(),
    };
  }
}