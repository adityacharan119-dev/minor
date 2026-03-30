import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import SectionTitle from '../../components/SectionTitle';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const query = searchParams.get('q') || '';

  useEffect(() => {
    fetchProducts({ search: query }).then((response) => setProducts(response.products));
  }, [query]);

  const title = useMemo(() => (query ? `Results for "${query}"` : 'Search the archive'), [query]);

  return (
    <div className="section-shell py-10">
      <SectionTitle eyebrow="Search" title={title} description="Use the top navigation search to filter tees, hoodies, pillows, blankets, mugs, and frames." />
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} accent={product.collection === 'streetwear' || product.collection === 'modern' ? 'neon' : 'gold'} />
        ))}
      </div>
    </div>
  );
}

export default SearchPage;
