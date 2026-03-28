'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Truck, ShieldCheck, Clock, Headphones } from 'lucide-react';

export default function HeroSection() {
  const [settings, setSettings] = useState({
    storeName: 'Oluwatobi Quincaillerie',
    storePhone: '+225 07 07 15 54 14',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings({
            storeName: data.settings.storeName || 'Oluwatobi Quincaillerie',
            storePhone: data.settings.storePhone || '+225 07 07 15 54 14',
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E94560]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4A574]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#E94560] animate-pulse" />
              <span className="text-sm text-white/90">Livraison gratuite à Abidjan</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Tout pour vos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E94560] to-[#D4A574]">
                travaux
              </span>{' '}
              en un seul endroit
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Plus de 5000 produits de qualité pour la plomberie, l&apos;électricité, la peinture et plus encore. 
              Prix compétitifs et service impeccable.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#catalogue">
                <Button 
                  size="lg" 
                  className="h-14 px-10 bg-[#E94560] hover:bg-[#d63850] text-white rounded-full font-semibold text-lg shadow-lg shadow-[#E94560]/30 hover:shadow-xl hover:shadow-[#E94560]/40 transition-all hover-lift"
                >
                  Découvrir nos produits
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <a href={`tel:${settings.storePhone.replace(/\s/g, '')}`}>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-14 px-10 border-2 border-white/30 text-white hover:bg-white/10 rounded-full font-semibold text-lg backdrop-blur-sm"
                >
                  <Headphones className="h-5 w-5 mr-2" />
                  Nous contacter
                </Button>
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-20 max-w-4xl mx-auto">
            {[
              { icon: Truck, title: 'Livraison rapide', desc: '24h à Abidjan' },
              { icon: ShieldCheck, title: 'Qualité garantie', desc: 'Produits certifiés' },
              { icon: Clock, title: 'Service 7j/7', desc: 'Support réactif' },
              { icon: ShieldCheck, title: 'Prix justes', desc: 'Meilleurs tarifs' },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-all animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E94560] to-[#D4A574] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-white/60">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" className="w-full">
          <path
            d="M0 100V60C240 20 480 0 720 20C960 40 1200 80 1440 60V100H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
