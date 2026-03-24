import { useEffect, useRef, useState } from 'react';
import { Heart, Scissors, ShoppingBag, Star, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchProduct, fetchProducts, submitCustomRequest } from '../../lib/api';
import { formatCurrency } from '../../lib/format';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard';
import CustomizedProductPreview from '../../components/CustomizedProductPreview';

const customizationDefaults = {
  name: '',
  email: '',
  phone: '',
  size: '',
  color: '',
  fabric: '',
  sleeve: '',
  neckline: '',
  fitNotes: '',
  description: '',
};

function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [customForm, setCustomForm] = useState(customizationDefaults);
  const [customState, setCustomState] = useState({ sending: false, message: '', type: '' });
  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [customImage, setCustomImage] = useState(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });
  const [imageScale, setImageScale] = useState(1);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const customizerRef = useRef(null);

  useEffect(() => {
    fetchProduct(slug).then((response) => {
      setProduct(response.product);
      setActiveImage(response.product.images[0]);
      setSelectedSize(response.product.sizes[0]);
      setSelectedColor(response.product.colors[0]);
      setCustomForm((previous) => ({
        ...previous,
        size: response.product.sizes[0],
        color: response.product.colors[0],
      }));

      fetchProducts({ collection: response.product.collection, limit: 4 }).then((relatedResponse) => {
        setRelated(relatedResponse.products.filter((item) => item.slug !== response.product.slug).slice(0, 4));
      });
    });

    setCustomText('');
    setTextColor('#ffffff');
    setTextPosition({ x: 50, y: 50 });
    setCustomImage(null);
    setCustomImageUrl('');
    setImagePosition({ x: 50, y: 50 });
    setImageScale(1);
    setShowCustomizer(false);
    setShowPreview(false);
  }, [slug]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setCustomForm((previous) => ({
      ...previous,
      name: previous.name || user.name,
      email: previous.email || user.email,
      phone: previous.phone || user.phone,
    }));
  }, [user]);

  useEffect(() => {
    if (!customImage) {
      setCustomImageUrl('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(customImage);
    setCustomImageUrl(nextUrl);

    return () => URL.revokeObjectURL(nextUrl);
  }, [customImage]);

  useEffect(() => {
    if (!showCustomizer || !customizerRef.current) {
      return;
    }

    customizerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [showCustomizer]);

  if (!product) {
    return <div className="section-shell py-20 text-stone-400">Loading product...</div>;
  }

  const customizationPreview = {
    text: customText.trim(),
    textColor,
    textPosition,
    imageSrc: customImageUrl,
    imagePosition,
    imageScale,
  };
  const hasCustomizationChanges = Boolean(customizationPreview.text || customizationPreview.imageSrc);

  const handleBuyNow = () => {
    addToCart(product, { size: selectedSize, color: selectedColor });
    navigate('/checkout');
  };

  const handleCustomizerToggle = () => {
    setShowCustomizer((previous) => !previous);
    if (showPreview) {
      setShowPreview(false);
    }
  };

  const handlePreviewOpen = () => {
    setShowCustomizer(true);
    setShowPreview(true);
  };

  const handleAddCustomizedToCart = () => {
    addToCart(product, {
      size: selectedSize,
      color: selectedColor,
      previewImage: activeImage,
      customization: customizationPreview,
    });
    setShowPreview(false);
  };

  const handleCustomChange = (event) => {
    const { name, value } = event.target;
    setCustomForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleCustomizationSubmit = async (event) => {
    event.preventDefault();
    setCustomState({ sending: true, message: '', type: '' });

    const formData = new FormData();
    formData.append('name', customForm.name);
    formData.append('email', customForm.email);
    formData.append('phone', customForm.phone);
    formData.append('productType', product.collection);
    formData.append('productName', product.name);
    formData.append('size', customForm.size || selectedSize);
    formData.append('color', customForm.color || selectedColor);
    formData.append('fabric', customForm.fabric);
    formData.append('sleeve', customForm.sleeve);
    formData.append('neckline', customForm.neckline);
    formData.append('fitNotes', customForm.fitNotes);
    formData.append('description', customForm.description);

    try {
      const response = await submitCustomRequest(formData);
      setCustomState({
        sending: false,
        type: 'success',
        message: `Customization request submitted. Reference ${response.request.reference}. The admin will review your fabric and fitting details before setting the budget.`,
      });
      setCustomForm({
        ...customizationDefaults,
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        size: selectedSize,
        color: selectedColor,
      });
    } catch (error) {
      setCustomState({
        sending: false,
        type: 'error',
        message: error.response?.data?.message || 'Unable to submit customization request.',
      });
    }
  };

  return (
    <div className="section-shell py-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[34px] border border-white/10 bg-white/5">
            <img src={activeImage} alt={product.name} className="aspect-[4/5] w-full object-cover" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.images.map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(image)}
                className={`overflow-hidden rounded-[24px] border ${
                  activeImage === image ? 'border-amber-200/50' : 'border-white/10'
                }`}
              >
                <img src={image} alt={product.name} className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="luxury-panel rounded-[34px] border border-white/10 p-8">
          <p className="text-[11px] uppercase tracking-[0.35em] text-amber-200">{product.subcategory}</p>
          <h1 className="headline-font mt-3 text-5xl font-semibold text-stone-100">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3 text-stone-400">
            <div className="flex items-center gap-1 text-amber-200">
              <Star size={16} fill="currentColor" />
              <span>{product.rating}</span>
            </div>
            <span>Premium product rating</span>
          </div>
          <p className="mt-5 text-3xl font-bold text-stone-100">{formatCurrency(product.price)}</p>
          <p className="mt-5 text-base leading-7 text-stone-400">{product.description}</p>

          <div className="mt-8 space-y-6">
            <div>
              <p className="mb-3 text-sm text-stone-400">Size</p>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size);
                      setCustomForm((previous) => ({ ...previous, size }));
                    }}
                    className={`rounded-full border px-4 py-2 text-sm ${selectedSize === size ? 'border-amber-200/60 bg-amber-200/10 text-amber-100' : 'border-white/10 bg-white/5 text-stone-300'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm text-stone-400">Color</p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color);
                      setCustomForm((previous) => ({ ...previous, color }));
                    }}
                    className={`rounded-full border px-4 py-2 text-sm ${selectedColor === color ? 'border-cyan-300/60 bg-cyan-300/10 text-cyan-100' : 'border-white/10 bg-white/5 text-stone-300'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button type="button" onClick={() => addToCart(product, { size: selectedSize, color: selectedColor })} className="inline-flex items-center gap-3 rounded-full bg-amber-200 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black">
              <ShoppingBag size={16} />
              Add to Cart
            </button>
            <button type="button" onClick={handleBuyNow} className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-stone-100">
              Buy Now
            </button>
            {product.isCustomizable && (
              <button type="button" onClick={handleCustomizerToggle} className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-100">
                <Scissors size={16} />
                {showCustomizer ? 'Hide Customizer' : 'Customize'}
              </button>
            )}
            <button type="button" onClick={() => toggleWishlist(product)} className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-stone-100">
              <Heart size={16} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
              Wishlist
            </button>
          </div>
        </div>
      </div>

      {showCustomizer && (
        <section ref={customizerRef} className="mt-12 scroll-mt-32">
          <div className="luxury-panel rounded-[34px] border border-white/10 p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="headline-font text-3xl font-semibold text-stone-100">Customize with Text & Images</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-400">
                  Upload artwork, place your text, then use Preview Design to inspect the final look before
                  adding it to cart.
                </p>
              </div>
              <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100">
                Live design studio
              </div>
            </div>
            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              <div>
                <CustomizedProductPreview
                  imageSrc={activeImage}
                  productName={product.name}
                  customization={customizationPreview}
                  className="aspect-square rounded-2xl bg-stone-800"
                  imageClassName="h-full w-full object-cover"
                />
                <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-stone-400">
                  Base selected: <span className="text-stone-100">{selectedSize}</span> in{' '}
                  <span className="text-stone-100">{selectedColor}</span>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-stone-400">Custom Text</label>
                  <input type="text" value={customText} onChange={(e) => setCustomText(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
                </div>
                <div>
                  <label className="block text-sm text-stone-400">Text Color</label>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-stone-400">Text Position X (%)</label>
                  <input type="range" min="0" max="100" value={textPosition.x} onChange={(e) => setTextPosition(prev => ({ ...prev, x: parseInt(e.target.value) }))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm text-stone-400">Text Position Y (%)</label>
                  <input type="range" min="0" max="100" value={textPosition.y} onChange={(e) => setTextPosition(prev => ({ ...prev, y: parseInt(e.target.value) }))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm text-stone-400">Custom Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setCustomImage(e.target.files?.[0] || null)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-stone-400">Image Position X (%)</label>
                  <input type="range" min="0" max="100" value={imagePosition.x} onChange={(e) => setImagePosition(prev => ({ ...prev, x: parseInt(e.target.value) }))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm text-stone-400">Image Position Y (%)</label>
                  <input type="range" min="0" max="100" value={imagePosition.y} onChange={(e) => setImagePosition(prev => ({ ...prev, y: parseInt(e.target.value) }))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm text-stone-400">Image Scale</label>
                  <input type="range" min="0.1" max="2" step="0.1" value={imageScale} onChange={(e) => setImageScale(parseFloat(e.target.value))} className="w-full" />
                </div>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={handlePreviewOpen}
                    disabled={!hasCustomizationChanges}
                    className="inline-flex items-center gap-3 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Star size={16} />
                    Preview Design
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomizedToCart}
                    disabled={!hasCustomizationChanges}
                    className="inline-flex items-center gap-3 rounded-full bg-amber-200 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingBag size={16} />
                    Add Customized to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {showPreview ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-5xl overflow-hidden rounded-[34px] border border-white/10 bg-zinc-950 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300">Design Preview</p>
                <h3 className="headline-font mt-2 text-3xl font-semibold text-stone-100">{product.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-full border border-white/10 bg-white/5 p-3 text-stone-100 transition hover:border-white/25"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-8 p-6 lg:grid-cols-[1.2fr_0.8fr]">
              <CustomizedProductPreview
                imageSrc={activeImage}
                productName={product.name}
                customization={customizationPreview}
                className="aspect-[4/5] rounded-[28px] border border-white/10 bg-black"
                imageClassName="h-full w-full object-cover"
              />
              <div className="flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">Selected Base</p>
                    <p className="mt-2 text-lg font-semibold text-stone-100">{selectedSize} • {selectedColor}</p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">Custom Text</p>
                    <p className="mt-2 text-base text-stone-100">{customizationPreview.text || 'No text added'}</p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">Artwork</p>
                    <p className="mt-2 text-base text-stone-100">
                      {customizationPreview.imageSrc ? 'Custom artwork added' : 'No image added'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-stone-100"
                  >
                    Keep Editing
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomizedToCart}
                    className="inline-flex items-center gap-3 rounded-full bg-amber-200 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black"
                  >
                    <ShoppingBag size={16} />
                    Add Customized to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {product.isCustomizable ? (
        <section className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="luxury-panel rounded-[34px] border border-white/10 p-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100">
              <Scissors size={14} />
              Customize This Piece
            </div>
            <h2 className="headline-font mt-5 text-4xl font-semibold text-stone-100">
              Let the customer define fit, fabric, and finishing.
            </h2>
            <p className="mt-4 text-base leading-7 text-stone-400">
              This works for dresses, lehengas, sherwanis, kurtas, oversized tees, and hoodies. Customers
              choose fabric, fit, sleeve, and neckline direction first, then the admin decides the budget
              after review.
            </p>
            <div className="mt-8 space-y-4 text-sm text-stone-300">
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                Product: <span className="text-stone-100">{product.name}</span>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                Selected base: <span className="text-stone-100">{selectedSize}</span> in{' '}
                <span className="text-stone-100">{selectedColor}</span>
              </div>
            </div>
          </div>

          {!user ? (
            <div className="luxury-panel rounded-[34px] border border-white/10 p-8">
              <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300">Customer Login Required</p>
              <h3 className="headline-font mt-4 text-3xl font-semibold text-stone-100">
                Sign in before submitting customization details.
              </h3>
              <p className="mt-4 text-base leading-7 text-stone-400">
                Customers now need an account with mobile number, email, and signup verification before
                sending custom tailoring requests.
              </p>
              <Link
                to={`/login?redirect=${encodeURIComponent(`/product/${slug}`)}`}
                className="mt-6 inline-flex rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black"
              >
                Login / Sign Up
              </Link>
            </div>
          ) : (
            <form onSubmit={handleCustomizationSubmit} className="luxury-panel rounded-[34px] border border-white/10 p-8">
              <div className="mb-6 rounded-[22px] border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
                Signed in as {user.name}. Your customer account details are being used for this request.
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-stone-400">Name</span>
                  <input required name="name" value={customForm.name} onChange={handleCustomChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-stone-400">Email</span>
                  <input required type="email" name="email" value={customForm.email} onChange={handleCustomChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-stone-400">Phone</span>
                  <input required name="phone" value={customForm.phone} onChange={handleCustomChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-stone-400">Preferred Size</span>
                  <input name="size" value={customForm.size} onChange={handleCustomChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-stone-400">Preferred Color</span>
                  <input name="color" value={customForm.color} onChange={handleCustomChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-stone-400">Fabric</span>
                  <input name="fabric" value={customForm.fabric} onChange={handleCustomChange} placeholder="Silk, velvet, fleece, heavyweight cotton" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-stone-400">Sleeve Preference</span>
                  <input name="sleeve" value={customForm.sleeve} onChange={handleCustomChange} placeholder="Full sleeve, sleeveless, drop shoulder" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-stone-400">Neckline / Collar</span>
                  <input name="neckline" value={customForm.neckline} onChange={handleCustomChange} placeholder="Boat neck, mandarin collar, hoodie neck" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-stone-400">Fit Notes</span>
                  <textarea name="fitNotes" value={customForm.fitNotes} onChange={handleCustomChange} rows="3" placeholder="Alter waist, longer hem, oversized body, tighter sleeve opening" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-stone-400">Customization Requirements</span>
                  <textarea required name="description" value={customForm.description} onChange={handleCustomChange} rows="4" placeholder="Describe embroidery, print placement, styling references, measurements, and any changes you want." className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
                </label>
              </div>

              {customState.message ? (
                <p className={`mt-5 text-sm ${customState.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
                  {customState.message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={customState.sending}
                className="mt-6 inline-flex items-center gap-3 rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black disabled:opacity-60"
              >
                <Scissors size={16} />
                {customState.sending ? 'Sending Request' : 'Request Customization'}
              </button>
            </form>
          )}
        </section>
      ) : null}

      <section className="mt-14">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">Related Pieces</p>
          <h2 className="headline-font mt-3 text-4xl font-semibold text-stone-100">Continue the look.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} accent={item.collection === 'streetwear' || item.collection === 'modern' ? 'neon' : 'gold'} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProductPage;
