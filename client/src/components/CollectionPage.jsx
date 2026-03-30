import { useEffect, useState } from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { fetchProducts } from '../lib/api';
import ProductCard from './ProductCard';
import SectionTitle from './SectionTitle';
import { collectionMeta } from '../data/site';

function CollectionPage({ collectionKey }) {
  const [products, setProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    fetchProducts({ collection: collectionKey }).then((response) => {
      if (!ignore) {
        setProducts(response.products);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [collectionKey]);

  const meta = collectionMeta[collectionKey];
  const useCaseLabel =
    collectionKey === 'streetwear'
      ? 'T-Shirts + Hoodies'
      : collectionKey === 'modern'
        ? 'Daily Custom Basics'
        : 'Photo Gifts + Decor';
  const filters = ['All', ...new Set(products.map((product) => product.subcategory))];
  const visibleProducts =
    activeFilter === 'All'
      ? products
      : products.filter((product) => product.subcategory === activeFilter);

  return (
    <div className="pb-20 pt-8">
      <section className="section-shell">
        <div className="luxury-panel overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950/70 p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-end">
            <SectionTitle
              eyebrow={meta.eyebrow}
              title={meta.title}
              description={meta.description}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[24px] bg-gradient-to-br from-amber-200/15 to-transparent p-5">
                <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">Pieces</p>
                <p className="mt-3 text-4xl font-bold text-stone-100">{products.length}</p>
              </div>
              <div className="rounded-[24px] bg-gradient-to-br from-cyan-300/15 to-transparent p-5">
                <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">Made For</p>
                <p className="mt-3 text-lg font-semibold text-stone-100">{useCaseLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-10">
        <div className="flex flex-col gap-5 rounded-[28px] border border-white/10 bg-zinc-950/50 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-stone-400">
            <Filter size={16} />
            Category Filters
          </div>
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  activeFilter === filter
                    ? 'border-amber-200/60 bg-amber-200/10 text-amber-100'
                    : 'border-white/10 bg-white/5 text-stone-300 hover:border-white/25'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="hidden items-center gap-2 text-sm text-stone-500 md:flex">
            <SlidersHorizontal size={16} />
            Filter by product type
          </div>
        </div>
      </section>

      <section className="section-shell mt-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-[420px] animate-pulse rounded-[28px] bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                accent={meta.accent === 'neon' || meta.accent === 'ice' ? 'neon' : 'gold'}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CollectionPage;
