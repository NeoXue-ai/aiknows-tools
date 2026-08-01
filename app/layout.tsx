import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Plausible } from "@/components/plausible";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageTransition } from "@/components/page-transition";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  // font-display: optional — the browser uses the metrics-matched fallback
  // for the first 100ms, then keeps it if the real font isn't loaded yet.
  // Prevents the hero h1 from being re-painted when the swap fires, which
  // was adding ~1.1s to mobile LCP.
  display: "optional",
  // adjustFontFallback (default true) sizes the synthetic fallback so the
  // text width/height matches Instrument Serif closely — no layout shift
  // if the swap does happen.
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "aiknows.tools — recorded AI tool index",
    template: "%s | aiknows.tools",
  },
  description:
    "An evidence-led index of recorded AI tools and directory submission facts. Inspect what is recorded — no popularity ranking, no star ratings.",
  icons: {
    // SVG first — modern browsers pick the scalable vector with embedded
    // prefers-color-scheme (dark mark on light tab, light mark on dark tab).
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "aiknows.tools",
    locale: "en_US",
    url: "/",
    title: "aiknows.tools — recorded AI tool index",
    description:
      "An evidence-led index of recorded AI tools and directory submission facts. Inspect what is recorded — no popularity ranking, no star ratings.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Browser chrome (iOS status bar, Android address bar, PWA tile background).
// Pairs with the favicon's adaptive stroke so the brand feels consistent
// across light/dark surfaces.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1018" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          // Site identity: dark is the default. enableSystem is off so the
          // site doesn't track the OS preference — the header toggle exposes
          // light/dark only.
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </ThemeProvider>
        {plausibleDomain ? <Plausible domain={plausibleDomain} /> : null}
      </body>
    </html>
  );
}
