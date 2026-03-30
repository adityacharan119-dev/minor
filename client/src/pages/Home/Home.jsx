import { ArrowRight, Gem, Shirt, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchProducts } from '../../lib/api';
import { formatCurrency } from '../../lib/format';
import { homeCategories, instagramMoments, testimonials } from '../../data/site';
import ProductCard from '../../components/ProductCard';
import SectionTitle from '../../components/SectionTitle';

function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetchProducts({ featured: true, limit: 8 }).then((response) => setFeatured(response.products));
  }, []);

  const heroProducts = featured.slice(0, 4);

  return (
    <div className="overflow-hidden pb-20">
      <section className="section-shell py-8">
        <div className="luxury-panel overflow-hidden rounded-[36px] border border-white/10 bg-black">
          <div className="grid gap-3 p-3 lg:grid-cols-[1.25fr_0.95fr]">
            <div className="relative min-h-[560px] overflow-hidden rounded-[30px] bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-8 md:p-12">
              <div className="absolute left-[-10%] top-16 h-72 w-72 rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),rgba(0,0,0,0.1)_45%,rgba(212,175,53,0.25)_75%,transparent_76%)] shadow-[0_0_120px_rgba(212,175,53,0.18)]" />
              <div className="absolute left-[18%] top-[19%] h-48 w-48 rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.1),rgba(0,0,0,0.18)_46%,rgba(255,255,255,0.04)_68%,transparent_70%)]" />
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-stone-500">
                  <span>MyCraft</span>
                  <span>Custom Jewelry + Fashion</span>
                </div>
                <div className="max-w-xl space-y-6">
                  <p className="text-[11px] uppercase tracking-[0.45em] text-amber-200">Edit It Live</p>
                  <h1 className="headline-font text-6xl font-semibold leading-none text-stone-100 md:text-8xl">
                    Real-time custom products for streetwear, gifts, and home moments.
                  </h1>
                  <p className="max-w-lg text-base leading-7 text-stone-400 md:text-lg">
                    Upload a photo, crop it, resize it, and preview it instantly on t-shirts, hoodies,
                    pillows, blankets, mugs, and photo frames.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/streetwear"
                      className="inline-flex items-center gap-3 rounded-full bg-amber-200 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black transition hover:scale-[1.02]"
                    >
                      Shop Now
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      to="/custom"
                      className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-stone-100 transition hover:border-cyan-300/30 hover:text-cyan-200"
                    >
                      Custom Order
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {heroProducts.map((product, index) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className={`group relative min-h-[180px] overflow-hidden rounded-[28px] border border-white/10 ${
                    index === 0 ? 'sm:col-span-2 lg:min-h-[250px]' : ''
                  }`}
                >
                  <img
                    src={product.images[1] || product.images[0]}
                    alt={product.name}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                  <div className="relative flex h-full flex-col justify-end p-6">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-stone-400">{product.subcategory}</p>
                    <p className="headline-font text-3xl font-semibold text-stone-100">{product.name}</p>
                    <p className="mt-2 text-sm text-amber-100">{formatCurrency(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-14">
        <SectionTitle
          eyebrow="Curated Categories"
          title="Streetwear first, with photo gifts and home products ready for live editing."
          description="Each collection is built around faster customization, clearer pricing, and real-time previewing."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {homeCategories.map((category, index) => (
            <Link
              key={category.title}
              to={category.path}
              className="group luxury-panel relative overflow-hidden rounded-[30px] border border-white/10 p-7"
            >
              <div
                className={`absolute inset-0 ${
                  index % 2 === 0
                    ? 'bg-[radial-gradient(circle_at_top_right,rgba(212,175,53,0.18),transparent_35%)]'
                    : 'bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%)]'
                }`}
              />
              <div className="relative flex min-h-[240px] flex-col justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  {index === 0 ? <Sparkles /> : index === 1 ? <Shirt /> : index === 2 ? <Star /> : <Gem />}
                </div>
                <div>
                  <p className="headline-font text-4xl font-semibold text-stone-100">{category.title}</p>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-stone-400">{category.subtitle}</p>
                  <p className="mt-5 text-xs uppercase tracking-[0.35em] text-stone-500 transition group-hover:text-amber-200">
                    Explore Collection
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-shell mt-16">
        <div className="flex items-end justify-between gap-6">
          <SectionTitle
            eyebrow="Featured Products"
            title="Best-selling custom pieces under ₹2000."
            description="Priority is on t-shirts and hoodies, with pillows, blankets, mugs, and frames ready to personalize."
          />
          <Link to="/search" className="hidden text-sm uppercase tracking-[0.35em] text-stone-400 md:block">
            View All
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              accent={product.collection === 'streetwear' || product.collection === 'modern' ? 'neon' : 'gold'}
            />
          ))}
        </div>
      </section>

      <section className="section-shell mt-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="luxury-panel rounded-[32px] border border-white/10 p-8 md:p-10">
            <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-300">Brand Story</p>
            <h2 className="headline-font mt-4 text-5xl font-semibold text-stone-100">
              Built for customization, not guesswork.
            </h2>
            <p className="mt-5 text-base leading-7 text-stone-400">
              MyCraft now focuses on affordable custom products that customers can actually edit in real time.
              The goal is simple: upload an image, crop it properly, change colours, preview it instantly, and
              buy with confidence.
            </p>
            <Link
              to="/custom"
              className="mt-8 inline-flex rounded-full border border-amber-200/25 bg-amber-200/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-amber-100"
            >
              Start a Bespoke Request
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {testimonials.map((item) => (
              <div key={item.name} className="luxury-panel rounded-[28px] border border-white/10 p-7">
                <div className="mb-5 flex gap-1 text-amber-200">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="text-base leading-7 text-stone-300">“{item.quote}”</p>
                <div className="mt-6">
                  <p className="font-semibold text-stone-100">{item.name}</p>
                  <p className="text-sm text-stone-500">{item.role}</p>
                </div>
              </div>
            ))}
            <div className="luxury-panel rounded-[28px] border border-white/10 p-7 md:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.4em] text-stone-500">Instagram Gallery</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {featured.slice(0, 6).map((item, index) => (
                  <div key={item.id} className="overflow-hidden rounded-[22px] border border-white/10">
                    <img src={item.images[2] || item.images[0]} alt={instagramMoments[index]} className="aspect-square w-full object-cover" />
                    <div className="border-t border-white/10 bg-black/40 px-4 py-3 text-xs uppercase tracking-[0.25em] text-stone-400">
                      {instagramMoments[index]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
