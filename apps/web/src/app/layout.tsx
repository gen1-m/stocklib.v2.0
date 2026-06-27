import type { Metadata } from "next";
import { Cabin, Fira_Sans} from "next/font/google";
import "./globals.css";

const cabin = Cabin({
  subsets: ["latin"],
  variable: "--app-font-cabin",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const firaSans = Fira_Sans({
  subsets: ["latin"],
  variable: "--app-font-fira-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StockLib",
    template: "%s | StockLib",
  },
  description:
    "StockLib is a full-stack market intelligence platform for stocks, crypto, news, watchlists, and AI-assisted research.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cabin.variable} ${firaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}