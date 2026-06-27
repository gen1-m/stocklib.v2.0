import { SectionCard } from "@/components/dashboard/section-card";

export default function SettingsPage() {
  return (
    <SectionCard
      title="Settings"
      description="Manage theme, notifications, watchlist preferences, and account details."
    >
      <p className="text-sm text-muted">
        This is a placeholder for user preferences and app configuration.
      </p>
    </SectionCard>
  );
}