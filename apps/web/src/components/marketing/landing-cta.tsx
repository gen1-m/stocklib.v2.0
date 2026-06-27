import Link from "next/link";

export function LandingCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      <div className="rounded-[32px] border border-border bg-surface px-6 py-10 md:px-10 md:py-14">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">
          Start building
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          Open the first dashboard shell and start shaping the product from real UI.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted md:text-base">
          You already have the monorepo, routing, Tailwind, and Turbo setup in place.
          Now the app can evolve through actual screens instead of placeholders.
        </p>

        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}