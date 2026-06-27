type StatCardProps = {
  label: string;
  value: string;
  change: string;
};

export function StatCard({ label, value, change }: StatCardProps) {
  const positive = change.trim().startsWith("+");

  return (
    <article className="rounded-3xl border border-border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className={`mt-2 text-sm ${positive ? "text-success" : "text-muted"}`}>
        {change}
      </p>
    </article>
  );
}