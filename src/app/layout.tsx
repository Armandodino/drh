import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
};

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "DRH Yopougon - Gestion des Congés",
  description: "Système de gestion des congés et ressources humaines de la Mairie de Yopougon",
  keywords: ["DRH", "Yopougon", "Congés", "Ressources Humaines", "Mairie"],
  authors: [{ name: "Commune de Yopougon" }],
  icons: {
    icon: "/AbidjanLogo.png",
  },
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
