import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://agntforge.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "AgntForge — Build Claude Code Agents Without Writing Prompts",
    template: "%s | AgntForge",
  },
  description:
    "Build production-ready Claude Code agent configurations in minutes. Smart interview, visual builder, and AI-powered generation — no prompt engineering required.",
  keywords: [
    "Claude Code",
    "AI agent builder",
    "Claude agent",
    "prompt engineering",
    "CLAUDE.md generator",
    "system prompt builder",
    "AI coding assistant",
    "no-code agent builder",
    "Claude Code configuration",
    "AI developer tools",
  ],
  authors: [{ name: "Talha Rasool" }],
  creator: "Talha Rasool",
  publisher: "AgntForge",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "AgntForge",
    title: "AgntForge — Build Claude Code Agents Without Writing Prompts",
    description:
      "Build production-ready Claude Code agent configurations in minutes. Smart interview, visual builder, and AI-powered generation — no prompt engineering required.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AgntForge — AI Agent Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgntForge — Build Claude Code Agents Without Writing Prompts",
    description:
      "Build production-ready Claude Code agent configurations in minutes. No prompt engineering required.",
    images: ["/og-image.png"],
    creator: "@talharasool",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ?? "",
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION ?? "",
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION ?? "",
    },
  },
  category: "Developer Tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AgntForge",
    description:
      "Build production-ready Claude Code agent configurations in minutes without writing prompts.",
    url: SITE_URL,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Talha Rasool",
    },
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistMono.variable} antialiased bg-[#0a0a0f] text-zinc-100`}
      >
        {children}
      </body>
    </html>
  );
}
