'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import HeroSection from '@/components/store/sections/HeroSection';
import CategoriesSection from '@/components/store/sections/CategoriesSection';
import FeaturedProductsSection from '@/components/store/sections/FeaturedProductsSection';
import CatalogSection from '@/components/store/sections/CatalogSection';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone } from 'lucide-react';

export default function Home() {
  const [settings, setSettings] = useState({
    whatsappNumber: '2250707155414',
    storePhone: '2250506363001',
  });

  useEffect(() => {
    fetch('/api/seed', { method: 'POST' })
      .then(res => res.json())
      .then(data => console.log('Seed result:', data))
      .catch(err => console.error('Seed error:', err));

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings({
            whatsappNumber: data.settings.whatsappNumber?.replace(/\D/g, '') || '2250707155414',
            storePhone: data.settings.storePhone?.replace(/\D/g, '') || '2250506363001',
          });
        }
      })
      .catch(err => console.error('Settings error:', err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <FeaturedProductsSection />
        <CatalogSection />
      </main>

      <Footer />

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/${settings.whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group"
      >
        <Button
          size="lg"
          className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all hover:scale-110"
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      </a>

      {/* Call Button - Mobile */}
      <a
        href={`tel:${settings.storePhone}`}
        className="fixed bottom-6 left-6 z-50 md:hidden"
      >
        <Button
          size="lg"
          className="h-16 w-16 rounded-full bg-[#E94560] hover:bg-[#d63850] text-white shadow-2xl shadow-[#E94560]/30"
        >
          <Phone className="h-7 w-7" />
        </Button>
      </a>
    </div>
  );
}
