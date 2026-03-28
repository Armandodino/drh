import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DRH Yopougon - Direction des Ressources Humaines",
  description: "Système de gestion des ressources humaines de la Mairie de Yopougon. Gestion des agents, congés, et documents administratifs.",
  keywords: ["DRH", "Yopougon", "Mairie", "Ressources Humaines", "Congés", "Agents"],
  authors: [{ name: "Mairie de Yopougon" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "DRH Yopougon - Mairie de Yopougon",
    description: "Direction des Ressources Humaines",
    type: "website",
    locale: "fr_CI",
  },
  themeColor: "#1152d4",
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
        <link 
          href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${inter.variable} antialiased bg-slate-50`}>
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
