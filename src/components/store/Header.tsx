'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, Search, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCartStore } from '@/store/cartStore';
import CartDrawer from './CartDrawer';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Oluwatobi Quincaillerie',
    storePhone: '+225 07 07 15 54 14',
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setStoreSettings({
            storeName: data.settings.storeName || 'Oluwatobi Quincaillerie',
            storePhone: data.settings.storePhone || '+225 07 07 15 54 14',
          });
        }
      })
      .catch(() => {});
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#1A1A2E] text-white py-2.5">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2 text-sm">
          <span className="text-[#D4A574]">✨ Nouveau</span>
          <span className="text-gray-300">Livraison gratuite à Abidjan dès 50 000 FCFA</span>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-md' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-100 group-hover:ring-[#E94560] transition-all">
                <Image
                  src="/images/logo-store.jpeg"
                  alt="Oluwatobi Quincaillerie"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Oluwatobi</h1>
                <p className="text-sm font-medium text-[#E94560] tracking-wide">QUINCAILLERIE</p>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full group">
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  className="w-full h-12 pl-5 pr-14 rounded-full bg-gray-100 border-2 border-transparent focus:border-[#E94560] focus:bg-white transition-all outline-none"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#E94560] hover:bg-[#d63850] text-white flex items-center justify-center transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Phone - Desktop */}
              <a
                href={`tel:${storeSettings.storePhone.replace(/\s/g, '')}`}
                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Phone className="h-4 w-4 text-[#E94560]" />
                <span className="text-sm font-medium text-gray-700">{storeSettings.storePhone}</span>
              </a>

              {/* Admin Link */}
              <Link href="/admin" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </Link>

              {/* Cart */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="relative h-12 w-12 rounded-full bg-gray-100 hover:bg-[#E94560] hover:text-white transition-all group">
                    <ShoppingCart className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors" />
                    {itemCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#E94560] text-white text-xs flex items-center justify-center p-0 border-2 border-white font-bold">
                        {itemCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md p-0">
                  <CartDrawer />
                </SheetContent>
              </Sheet>

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                className="md:hidden h-12 w-12 rounded-full"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <div className="hidden md:block border-t border-gray-100">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-8 h-14">
              {[
                { href: '/', label: 'Accueil' },
                { href: '#categories', label: 'Catégories' },
                { href: '#catalogue', label: 'Produits' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-sm font-medium text-gray-600 hover:text-[#E94560] transition-colors py-4 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#E94560] group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
            <div className="container mx-auto px-4 py-6">
              {/* Mobile Search */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full h-12 pl-5 pr-14 rounded-full bg-gray-100 outline-none"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#E94560] text-white flex items-center justify-center">
                  <Search className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile Nav */}
              <nav className="space-y-1">
                {[
                  { href: '/', label: 'Accueil' },
                  { href: '#categories', label: 'Catégories' },
                  { href: '#catalogue', label: 'Produits' },
                  { href: '/admin', label: 'Administration' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-[#E94560] hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Call */}
              <a
                href={`tel:${storeSettings.storePhone.replace(/\s/g, '')}`}
                className="flex items-center justify-center gap-2 w-full mt-6 py-4 bg-[#E94560] text-white rounded-full font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone className="h-5 w-5" />
                Appeler maintenant
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
