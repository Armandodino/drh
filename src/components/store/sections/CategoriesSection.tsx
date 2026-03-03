'use client';

import { useEffect, useState } from 'react';
import { Droplets, Zap, Paintbrush, Wrench, Cog, Building2, Loader2, ArrowRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  _count: {
    products: number;
  };
}

const iconMap: Record<string, React.ElementType> = {
  Droplets,
  Zap,
  Paintbrush,
  Wrench,
  Cog,
  Building2,
};

const gradients = [
  'from-blue-500 to-cyan-400',
  'from-yellow-500 to-orange-400',
  'from-purple-500 to-pink-400',
  'from-red-500 to-rose-400',
  'from-gray-600 to-gray-400',
  'from-green-500 to-emerald-400',
];

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#E94560]" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-semibold text-[#E94560] tracking-wide uppercase mb-3">
            Nos Départements
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explorez nos catégories
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Une sélection complète de produits pour tous vos projets
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {categories.map((category, index) => {
            const IconComponent = iconMap[category.icon || ''] || Cog;
            const gradient = gradients[index % gradients.length];
            
            return (
              <a
                key={category.id}
                href={`#catalogue?category=${category.id}`}
                className="group relative bg-gray-50 hover:bg-white rounded-3xl p-6 text-center transition-all duration-300 hover-lift border border-transparent hover:border-gray-100 hover:shadow-xl"
              >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#E94560] transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {category._count.products} produits
                </p>

                {/* Arrow */}
                <div className="mt-3 flex items-center justify-center text-sm font-medium text-[#E94560] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Voir</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
