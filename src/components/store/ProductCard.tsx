'use client';

import { ShoppingBag, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  image: string | null;
  stock: number;
  featured: boolean;
  category?: {
    name: string;
  } | null;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
    });
    setTimeout(() => setIsAdding(false), 600);
  };

  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0;

  const isOutOfStock = product.stock === 0;

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-2xl transition-all duration-500 hover-lift">
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="h-16 w-16 text-gray-200" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Sale Badge */}
        {hasDiscount && (
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1 bg-[#E94560] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              -{discountPercentage}%
            </span>
          </div>
        )}

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 bg-[#D4A574] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <Star className="h-3 w-3 fill-current" />
              TOP
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
            isLiked 
              ? 'bg-[#E94560] text-white scale-110' 
              : 'bg-white text-gray-400 hover:text-[#E94560] hover:scale-110'
          } opacity-0 group-hover:opacity-100`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Out of Stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-gray-900 text-white text-sm font-semibold px-6 py-2.5 rounded-full">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        {product.category && (
          <span className="text-xs font-medium text-[#E94560] uppercase tracking-wide">
            {product.category.name}
          </span>
        )}

        {/* Name */}
        <h3 className="font-semibold text-gray-900 mt-1.5 mb-2 line-clamp-2 leading-snug group-hover:text-[#E94560] transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">
            {product.price.toLocaleString()}
          </span>
          <span className="text-sm text-gray-400">FCFA</span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through ml-auto">
              {product.oldPrice!.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <Button
          className={`w-full h-12 rounded-2xl font-semibold transition-all duration-300 ${
            isAdding 
              ? 'bg-green-500 hover:bg-green-500 text-white' 
              : 'bg-gray-900 hover:bg-[#E94560] text-white'
          }`}
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
        >
          {isAdding ? (
            <>
              <ShoppingBag className="h-5 w-5 mr-2" />
              Ajouté ✓
            </>
          ) : (
            <>
              <ShoppingBag className="h-5 w-5 mr-2" />
              Ajouter au panier
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
