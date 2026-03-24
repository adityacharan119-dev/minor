import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/format';

function ProductCard({ product, accent = 'gold' }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  const accentClasses =
    accent === 'neon'
      ? 'from-cyan-400/30 via-cyan-300/10 to-transparent border-cyan-300/20'
      : 'from-amber-300/25 via-amber-200/10 to-transparent border-amber-200/15';

  return (
    <motion.article
      whileHover={{ y: -6 }}
      className={`group relative overflow-hidden rounded-[28px] border bg-zinc-950/70 ${accentClasses} luxury-panel`}
    >
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b pointer-events-none" />
      <Link to={`/product/${product.slug}`} className="block">
        <div className="aspect-[4/5] overflow-hidden rounded-[26px]">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">{product.subcategory}</p>
            <Link to={`/product/${product.slug}`} className="mt-2 block text-xl font-semibold text-stone-100">
              {product.name}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className={`rounded-full border p-2 transition ${
              isWishlisted(product.id)
                ? 'border-amber-300/60 bg-amber-300/10 text-amber-200'
                : 'border-white/10 bg-white/5 text-stone-300 hover:border-white/25'
            }`}
          >
            <Heart size={16} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-stone-400">
          <Star size={14} className="text-amber-300" fill="currentColor" />
          <span>{product.rating}</span>
          <span className="text-stone-600">/ 5</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-stone-50">{formatCurrency(product.price)}</p>
          <button
            type="button"
            onClick={() => addToCart(product)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-stone-100 transition hover:border-white/25 hover:bg-white/10"
          >
            <ShoppingBag size={15} />
            Add
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCard;
