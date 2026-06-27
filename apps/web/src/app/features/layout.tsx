import { Navbar } from "@/components/marketing/navbar";

export default function FeaturesLayout({ children, }: { children: React.ReactNode; }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="mx-auto flex min-h-screen max-w-screen">
                {children}
            </div>
        </div>
    );
}