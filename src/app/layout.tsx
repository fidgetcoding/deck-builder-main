import type { Metadata } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import ViewTransitionHandler from "@/components/ViewTransitionHandler";
import DeckUpdateWatcher from "@/components/DeckUpdateWatcher";
import { BrandProvider } from "@/components/BrandContext";
import { brand } from "@/lib/brand";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const title = `${brand.name} Deck`;
const description = "A deck that's a link, not a file.";

export const metadata: Metadata = {
  title: { default: title, template: `%s | ${title}` },
  description,
  metadataBase: new URL(siteUrl),
  authors: [{ name: brand.name }],
  creator: brand.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: title,
    title,
    description,
    images: [{ url: "/social.png", width: 1200, height: 630, alt: description }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/social.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-deck-build={process.env.DECK_BUILD_ID}
      className={`${geistMono.variable} ${outfit.variable} h-full antialiased`}
      style={{ "--brand-green-light": brand.accent } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col">
        <ViewTransitionHandler />
        <DeckUpdateWatcher />
        <BrandProvider brand={brand}>{children}</BrandProvider>
        <Analytics />
      </body>
    </html>
  );
}
