'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, MapPin, Mail, Clock, Facebook, Instagram, Send, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const [settings, setSettings] = useState({
    storeName: 'Oluwatobi Quincaillerie',
    storePhone: '+225 07 07 15 54 14',
    storeEmail: 'contact@oluwaquincaillerie.ci',
    storeAddress: 'Abidjan, Côte d\'Ivoire',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings({
            storeName: data.settings.storeName || 'Oluwatobi Quincaillerie',
            storePhone: data.settings.storePhone || '+225 07 07 15 54 14',
            storeEmail: data.settings.storeEmail || 'contact@oluwaquincaillerie.ci',
            storeAddress: data.settings.storeAddress || 'Abidjan, Côte d\'Ivoire',
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-[#1A1A2E] text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Restez informé</h3>
              <p className="text-white/60 text-sm">Recevez nos offres exclusives</p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 md:w-80 h-12 px-5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:border-[#E94560] transition-colors"
              />
              <Button className="h-12 px-6 bg-[#E94560] hover:bg-[#d63850] text-white rounded-full font-medium">
                <Send className="h-4 w-4 mr-2" />
                S'inscrire
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white">
                <Image
                  src="/images/logo-store.jpeg"
                  alt="Oluwatobi"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg">Oluwatobi</h3>
                <p className="text-xs text-[#E94560] font-medium tracking-wide">QUINCAILLERIE</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Votre partenaire de confiance pour tous vos travaux de construction et rénovation.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E94560] transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E94560] transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-5">Navigation</h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Accueil' },
                { href: '#categories', label: 'Catégories' },
                { href: '#catalogue', label: 'Produits' },
                { href: '/admin', label: 'Admin' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm flex items-center gap-2 transition-colors group"
                  >
                    <ArrowRight className="h-3 w-3 text-[#E94560] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-5">Catégories</h4>
            <ul className="space-y-3">
              {['Plomberie', 'Électricité', 'Peinture', 'Outils', 'Quincaillerie'].map((cat) => (
                <li key={cat}>
                  <Link 
                    href="#catalogue"
                    className="text-white/60 hover:text-white text-sm flex items-center gap-2 transition-colors group"
                  >
                    <ArrowRight className="h-3 w-3 text-[#E94560] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-5">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#E94560]/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-[#E94560]" />
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Téléphone</p>
                  <a href={`tel:${settings.storePhone.replace(/\s/g, '')}`} className="text-sm text-white hover:text-[#E94560] transition-colors">
                    {settings.storePhone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#E94560]/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-[#E94560]" />
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Email</p>
                  <a href={`mailto:${settings.storeEmail}`} className="text-sm text-white hover:text-[#E94560] transition-colors">
                    {settings.storeEmail}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#E94560]/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-[#E94560]" />
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Adresse</p>
                  <span className="text-sm text-white">{settings.storeAddress}</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#E94560]/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-[#E94560]" />
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Horaires</p>
                  <span className="text-sm text-white">Lun-Sam: 7h-19h</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
            <p>
              © {new Date().getFullYear()} {settings.storeName}. Tous droits réservés.
            </p>
            <p className="flex items-center gap-2">
              🇨🇮 Made in Côte d&apos;Ivoire
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
