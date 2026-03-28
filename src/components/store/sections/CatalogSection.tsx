'use client';

import { useEffect, useState } from 'react';
import { Search, X, ChevronDown, Grid3X3, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    id: string;
    name: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
}

export default function CatalogSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        setProducts(productsData.products || []);
        setCategories(categoriesData.categories || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredProducts = products
    .filter((product) => {
      if (search) {
        const searchLower = search.toLowerCase();
        if (
          !product.name.toLowerCase().includes(searchLower) &&
          !product.description?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      if (selectedCategory !== 'all' && product.category?.id !== selectedCategory) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'featured':
        default:
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
      }
    });

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSortBy('featured');
  };

  const hasActiveFilters = search || selectedCategory !== 'all';

  if (loading) {
    return (
      <section id="catalogue" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">Chargement...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="catalogue" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Notre Catalogue
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Découvrez tous nos produits de qualité
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-3xl p-6 mb-10">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 rounded-full bg-white border-gray-200 focus:border-[#E94560] text-base"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-12 pl-5 pr-10 rounded-full bg-white border border-gray-200 text-sm font-medium appearance-none cursor-pointer min-w-[170px]"
                >
                  <option value="all">Toutes catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-12 pl-5 pr-10 rounded-full bg-white border border-gray-200 text-sm font-medium appearance-none cursor-pointer min-w-[150px]"
                >
                  <option value="featured">En vedette</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="name">Nom A-Z</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Mode */}
              <div className="hidden md:flex items-center rounded-full border border-gray-200 overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`h-12 w-12 flex items-center justify-center transition-colors ${
                    viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`h-12 w-12 flex items-center justify-center transition-colors ${
                    viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <LayoutList className="h-4 w-4" />
                </button>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="h-12 px-4 rounded-full text-[#E94560] hover:bg-[#E94560]/10"
                >
                  <X className="h-4 w-4 mr-1" />
                  Effacer
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">Filtres:</span>
              {search && (
                <span className="inline-flex items-center gap-1 bg-[#E94560]/10 text-[#E94560] text-sm px-3 py-1 rounded-full">
                  "{search}"
                  <button onClick={() => setSearch('')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-[#E94560]/10 text-[#E94560] text-sm px-3 py-1 rounded-full">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('all')}><X className="h-3 w-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <p className="text-sm text-gray-500 mb-6">
          <span className="font-semibold text-gray-900">{filteredProducts.length}</span> produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
        </p>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-600 text-lg font-medium mb-2">Aucun produit trouvé</p>
            <p className="text-gray-400 text-sm mb-6">Essayez de modifier vos critères</p>
            <Button onClick={clearFilters} className="rounded-full">
              Effacer les filtres
            </Button>
          </div>
        ) : (
          <div className={`grid gap-5 md:gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
