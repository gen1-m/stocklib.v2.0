export default function FeaturesPage() {
    const features = [
        {
            number: "01",
            title: "Live Market Data",
            description:
                "Stay connected to the market with continuously updated prices, daily changes, trading volume, and market status.",
            details: ["Real-time prices", "Market status", "Daily performance"],
        },
        {
            number: "02",
            title: "Company Intelligence",
            description:
                "Explore the information behind every company. Review financial metrics, company details, analyst recommendations, and recent news.",
            details: ["Financial metrics", "Analyst recommendations", "Company news"],
        },
        {
            number: "03",
            title: "Track What Matters",
            description:
                "Build your own watchlists and keep the companies you care about within reach from a single dashboard.",
            details: ["Custom watchlists", "Tracked assets", "Personal dashboard"],
        },
    ];

    return (
        <main className="min-h-full bg-background">
            <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
                <div className="max-w-3xl">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                        Stocklib
                    </p>

                    <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                        Everything you need to understand the market.
                    </h1>

                    <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                        A focused market information platform built to help you
                        discover companies, follow market movements, and make
                        sense of the data behind the stocks you care about.
                    </p>
                </div>

                <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-border bg-border lg:grid-cols-3">
                    {features.map((feature) => (
                        <section
                            key={feature.number}
                            className="bg-surface p-8 transition-colors hover:bg-surface-2 lg:p-10"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-primary">
                                    {feature.number}
                                </span>

                                <span className="text-xs uppercase tracking-widest text-muted">
                                    Feature
                                </span>
                            </div>

                            <h2 className="mt-12 text-2xl font-semibold tracking-tight text-foreground">
                                {feature.title}
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-muted">
                                {feature.description}
                            </p>

                            <div className="mt-8 space-y-3 border-t border-border pt-6">
                                {feature.details.map((detail) => (
                                    <div
                                        key={detail}
                                        className="flex items-center gap-3 text-sm text-foreground"
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        {detail}
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <section className="mt-6 rounded-3xl border border-border bg-surface p-8 lg:p-10">
                    <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                        <div className="max-w-2xl">
                            <p className="text-sm font-medium text-primary">
                                Built for clarity
                            </p>

                            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                                Market information without the noise.
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-muted">
                                Stocklib brings prices, company information,
                                financial data, recommendations, and news
                                together in one clean interface.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {["Prices", "Financials", "News"].map((item) => (
                                <div
                                    key={item}
                                    className="rounded-2xl border border-border bg-surface-2 px-5 py-4 text-center text-sm font-medium text-foreground"
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}