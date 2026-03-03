import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oluwa Quincaillerie - Votre Partenaire Travaux à Abidjan",
  description: "Découvrez notre large sélection de produits de qualité pour la plomberie, l'électricité, la peinture, les outils et plus encore. Livraison rapide à Abidjan. Prix compétitifs.",
  keywords: ["quincaillerie", "plomberie", "électricité", "peinture", "outils", "bâtiment", "Abidjan", "Côte d'Ivoire", "Oluwa"],
  authors: [{ name: "Oluwa Quincaillerie" }],
  icons: {
    icon: "/images/logo-store.jpeg",
  },
  openGraph: {
    title: "Oluwa Quincaillerie - Votre Partenaire Travaux",
    description: "Tout pour vos travaux en un seul endroit. Livraison rapide à Abidjan.",
    type: "website",
    locale: "fr_CI",
    images: [
      {
        url: "/images/logo-store.jpeg",
        width: 1200,
        height: 630,
        alt: "Oluwa Quincaillerie",
      },
    ],
  },
  manifest: "/manifest.json",
  themeColor: "#E94560",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
