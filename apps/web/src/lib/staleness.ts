// apps/web/src/lib/staleness.ts
export function getStaleCutoffIso(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}