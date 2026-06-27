const features = [
  {
    title: "Focused watchlists",
    description:
      "Organize high-conviction names, entry zones, and notes without losing market context.",
  },
  {
    title: "Signal-driven dashboard",
    description:
      "Surface movers, alert events, and research summaries in a compact daily workflow.",
  },
  {
    title: "Built for iteration",
    description:
      "Start with a clean dashboard shell now and layer real data, auth, and analytics next.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Features</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          A calm interface for noisy markets
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-3xl border border-border bg-surface p-6"
          >
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}