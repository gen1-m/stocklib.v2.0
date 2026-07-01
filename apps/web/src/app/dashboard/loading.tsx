// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="h-dvh overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex h-full max-w-screen overflow-hidden">
        <div className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
          <div className="p-4 space-y-3">
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-border p-4 md:p-6">
            <div className="h-10 w-full max-w-md animate-pulse rounded bg-muted" />
          </div>

          <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="space-y-4">
              <div className="h-8 w-48 animate-pulse rounded bg-muted" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="h-32 animate-pulse rounded-xl bg-muted" />
                <div className="h-32 animate-pulse rounded-xl bg-muted" />
                <div className="h-32 animate-pulse rounded-xl bg-muted" />
              </div>
              <div className="h-64 animate-pulse rounded-xl bg-muted" />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}