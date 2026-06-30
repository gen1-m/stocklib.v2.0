// apps/web/src/app/auth/sign-in/page.tsx
import Link from "next/link";
import { signIn } from "../actions";

type SearchParams = Promise<{
  error?: string;
  success?: string;
}>;

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const error = params?.error;
  const success = params?.success;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden border-r border-border bg-surface-2 p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
                Market platform
              </p>
              <h1 className="max-w-md text-4xl font-semibold tracking-tight">
                Track markets, manage watchlists, and act faster.
              </h1>
              <p className="max-w-md text-base text-muted">
                Sign in to access your dashboard, tracked assets, and upcoming market data
                sync features.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm text-muted">
                Secure sign-in with Supabase authentication and a private dashboard backed
                by row-level security.
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8 space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
                  Welcome back
                </p>
                <h2 className="text-3xl font-semibold tracking-tight">Sign in</h2>
                <p className="text-sm text-muted">
                  Use your email and password to enter your dashboard.
                </p>
              </div>

              {error ? (
                <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {success}
                </div>
              ) : null}

              <form action={signIn} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  Sign in
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between gap-4 text-sm">
                <Link href="/" className="text-muted transition hover:text-foreground">
                  Back to landing page
                </Link>

                <Link
                  href="/auth/sign-up"
                  className="font-medium text-primary transition hover:opacity-80"
                >
                  Create account
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}