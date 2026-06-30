// apps/web/src/app/dashboard/refresh-watchlist-state.ts
export type RefreshWatchlistState = {
  status: "idle" | "success" | "error";
  message: string;
  timestamp: number;
};

export const initialRefreshWatchlistState: RefreshWatchlistState = {
  status: "idle",
  message: "",
  timestamp: 0,
};