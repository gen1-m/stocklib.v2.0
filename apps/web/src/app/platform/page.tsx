export default function PlatformPage() {
    const pillars = [
        {
            number: "01",
            title: "Discover",
            description:
                "Find companies and explore the information that matters. Search across assets and quickly move from a company overview to the data behind it.",
        },
        {
            number: "02",
            title: "Understand",
            description:
                "Bring prices, financial metrics, company information, analyst recommendations, and news together in one place.",
        },
        {
            number: "03",
            title: "Follow",
            description:
                "Keep an eye on the companies that matter to you with personalized watchlists and continuously updated market information.",
        },
    ];

    return (
        <main className="min-h-full bg-background">
            <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
                <div className="max-w-3xl">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                        The Platform
                    </p>

                    <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                        A clearer way to explore the market.
                    </h1>

                    <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                        Stocklib brings market data and company information
                        together in a focused platform designed around
                        discovery, context, and tracking.
                    </p>
                </div>

                <section className="mt-16 overflow-hidden rounded-3xl border border-border bg-surface">
                    <div className="grid lg:grid-cols-2">
                        <div className="p-8 lg:p-12">
                            <p className="text-sm font-medium text-primary">
                                One platform
                            </p>

                            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                                From market overview to company detail.
                            </h2>

                            <p className="mt-5 text-sm leading-7 text-muted">
                                Move between the broader market and individual
                                companies without losing context. Stocklib
                                keeps the most relevant information close to
                                the assets you follow.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 border-t border-border bg-surface-2 sm:grid-cols-3 lg:border-l lg:border-t-0">
                            {[
                                ["Live", "Market data"],
                                ["Deep", "Company data"],
                                ["Personal", "Watchlists"],
                            ].map(([value, label]) => (
                                <div
                                    key={label}
                                    className="flex min-h-36 flex-col justify-center border-border p-6 sm:border-l first:sm:border-l-0 lg:first:border-l"
                                >
                                    <span className="text-lg font-semibold text-foreground">
                                        {value}
                                    </span>
                                    <span className="mt-1 text-sm text-muted">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    {pillars.map((pillar) => (
                        <section
                            key={pillar.number}
                            className="rounded-3xl border border-border bg-surface p-8 transition-colors hover:bg-surface-2"
                        >
                            <span className="text-sm font-medium text-primary">
                                {pillar.number}
                            </span>

                            <h2 className="mt-10 text-2xl font-semibold tracking-tight text-foreground">
                                {pillar.title}
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-muted">
                                {pillar.description}
                            </p>
                        </section>
                    ))}
                </div>

                <section className="mt-6 rounded-3xl border border-border bg-surface p-8 lg:p-10">
                    <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="max-w-2xl">
                            <p className="text-sm font-medium text-primary">
                                Built around the data
                            </p>

                            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                                Information that stays connected.
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-muted">
                                Market prices, company profiles, financial
                                metrics, recommendations, and news work
                                together to give each asset a more complete
                                picture.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:max-w-sm lg:justify-end">
                            {[
                                "Market data",
                                "Company profiles",
                                "Financials",
                                "Recommendations",
                                "News",
                            ].map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full border border-border bg-surface-2 px-4 py-2 text-xs font-medium text-muted"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
