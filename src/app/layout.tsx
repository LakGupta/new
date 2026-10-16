import type { Metadata } from "next";
import { JetBrains_Mono, Sora, Unbounded } from "next/font/google";
import "./globals.css";

// Display face (variable: 700 for headings, 300–400 for lead copy). Swaps in
// over a metric-matched fallback, no preload, so it doesn't compete with the
// body font and HTML on slow connections.
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  preload: false,
});

// Body face: geometric and slightly wide, a calmer partner to Unbounded.
// Variable, so one file covers light prose through semibold labels.
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

// Mono is only for small labels and numbers: let it swap in without a preload
// competing with the display/body fonts on slow phones.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  preload: false,
});

const title = "Helio Strap Queue · India";
const description =
  "Official stock is gone. Join the first-come, first-served queue for the next Amazfit Helio Strap drop in India. Free shipping PAN India, prepaid only.";

// Vercel sets the production host; Open Graph image URLs need to be absolute.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_IN",
    images: [{ url: "/images/hero.jpg", alt: "Amazfit Helio Strap" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/hero.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The landing page's boot script sets data-intro / data-reveal on <html>
    // before hydration; those attributes are expected to differ.
    <html
      suppressHydrationWarning
      lang="en"
      className={`${unbounded.variable} ${sora.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
