import { FeatureGrid } from "@/components/marketing/feature-grid";
import { Hero } from "@/components/marketing/hero";
import { LandingCta } from "@/components/marketing/landing-cta";
import { Navbar } from "@/components/marketing/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <FeatureGrid />
        <LandingCta />
      </main>
    </div>
  );
}