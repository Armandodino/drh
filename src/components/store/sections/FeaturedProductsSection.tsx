'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductCard from '../ProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  image: string | null;
  stock: number;
  featured: boolean;
  category: {
    name: string;
  } | null;
}

export default function FeaturedProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products?featured=true');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#D4A574] mb-3">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-semibold tracking-wide uppercase">Sélection</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Produits populaires
            </h2>
          </div>
          <Link href="#catalogue" className="hidden md:block">
            <Button 
              variant="outline"
              className="h-12 px-6 rounded-full border-2 border-gray-200 hover:border-[#E94560] hover:text-[#E94560] font-medium"
            >
              Voir tout
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="text-center mt-10 md:hidden">
          <Link href="#catalogue">
            <Button className="h-12 px-8 bg-[#E94560] hover:bg-[#d63850] text-white rounded-full font-medium">
              Voir tout le catalogue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
