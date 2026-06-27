import { SectionCard } from "@/components/dashboard/section-card";

export default function TrackingPage() {
  return (
    <SectionCard
      title="Tracking"
      description="Use this page for market movers, sectors, indices, and macro context."
    >
      <p className="text-sm text-muted">
        A heatmap, movers list, and headline stream would fit well here.
      </p>
    </SectionCard>
  );
}