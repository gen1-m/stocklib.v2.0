import { SectionCard } from "@/components/dashboard/section-card";

export default function WatchlistPage() {
  return (
    <SectionCard
      title="Watchlist"
      description="This page will hold your saved instruments, notes, and target levels."
    >
      <p className="text-sm text-muted">
        Start with a table or card list once your market data layer is ready.
      </p>
    </SectionCard>
  );
}