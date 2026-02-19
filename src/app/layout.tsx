import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Corporate Innovation Diagnostic — Aieutics",
  description:
    "A diagnostic tool for corporate innovators. 18 binary questions across 5 dimensions reveal where your initiative is structurally at risk.",
  openGraph: {
    title: "Corporate Innovation Diagnostic — Aieutics",
    description:
      "Identify where your innovation initiative is structurally at risk — across 5 critical dimensions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Almarai:wght@300;400;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
          {children}
          <Analytics />
          <SpeedInsights />
        </body>
    </html>
  );
}
