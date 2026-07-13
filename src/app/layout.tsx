import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SiteNav } from "@/components/site-nav";
import { Assistant } from "@/components/assistant/assistant";
import { NAME, links } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_TITLE = "Harsh Gahlot — Software Engineer · Backend × Applied AI";
const SITE_DESCRIPTION =
  "Backend engineer (Java, Spring Boot, microservices) building applied-AI products. Portfolio built in public, sprint by sprint.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · Harsh Gahlot",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

// Person schema (S5) — rendered once on the root layout so it applies
// site-wide. `<` is escaped in the serialized JSON so a title/description
// containing "</script>" can never break out of the script tag.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: NAME,
  jobTitle: "Software Engineer",
  url: SITE_URL,
  sameAs: [links.github, links.linkedin],
  worksFor: {
    "@type": "Organization",
    name: "Mindsprint",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-bg text-ink">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
            }}
          />
          <SmoothScroll>
            <SiteNav />
            {children}
          </SmoothScroll>
          <Assistant />
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ViewTransitions>
  );
}
