import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Plausible } from "@/components/plausible";
import { ThemeProvider } from "@/components/theme-provider";
import { VercelAnalytics } from "@/components/vercel-analytics";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageTransition } from "@/components/page-transition";
import { siteUrl, siteName, siteTitle, siteDescription } from "@/lib/site";
import "./globals.css";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/icon.svg`,
  description: siteDescription,
};

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-editorial",
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
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteTitle} | ${siteName}`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  icons: {
    // SVG first — modern browsers pick the scalable vector with embedded
    // prefers-color-scheme (dark mark on light tab, light mark on dark tab).
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName,
    locale: "en_US",
    url: "/",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
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
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#161c18" },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <a
            href="#main-content"
            className="sr-only z-50 rounded-full bg-primary px-5 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-5 focus:top-4"
          >
            Skip to content
          </a>
          <Header />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </ThemeProvider>
        {plausibleDomain ? <Plausible domain={plausibleDomain} /> : null}
        <VercelAnalytics />
      </body>
    </html>
  );
}
