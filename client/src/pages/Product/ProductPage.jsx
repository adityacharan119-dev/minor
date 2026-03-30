import { useEffect, useRef, useState } from 'react';
import { Heart, ImagePlus, Scissors, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchProduct, fetchProducts, submitCustomRequest } from '../../lib/api';
import { formatCurrency, formatSelectedOptions } from '../../lib/format';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard';
import CustomizedProductPreview from '../../components/CustomizedProductPreview';

const fallbackTextPalette = ['#ffffff', '#111827', '#22d3ee', '#f97316', '#f59e0b', '#ec4899'];
const fallbackFramePalette = ['#ffffff', '#111827', '#22d3ee', '#f59e0b', '#fb7185'];
const fallbackPreviewDefaults = {
  textPosition: { x: 50, y: 72 },
  textSize: 34,
  imageFrame: { x: 50, y: 46, width: 34, height: 34, radius: 16 },
};

const customizationRequestDefaults = {
  name: '',
  email: '',
  phone: '',
  fabric: '',
  fitNotes: '',
  description: '',
};

const buildInitialSelectedOptions = (product) =>
  Object.fromEntries(
    (product?.customizationConfig?.optionGroups || []).map((group) => [group.key, group.values?.[0] || '']),
  );

const buildInitialCustomization = (product) => {
  const previewDefaults = product?.customizationConfig?.previewDefaults || fallbackPreviewDefaults;
  const textPalette = product?.customizationConfig?.textPalette || fallbackTextPalette;
  const framePalette = product?.customizationConfig?.framePalette || fallbackFramePalette;

  return {
    text: '',
    textColor: textPalette[0],
    textPosition: previewDefaults.textPosition || fallbackPreviewDefaults.textPosition,
    textSize: previewDefaults.textSize || fallbackPreviewDefaults.textSize,
    imageSrc: '',
    imagePosition: {
      x: previewDefaults.imageFrame?.x ?? fallbackPreviewDefaults.imageFrame.x,
      y: previewDefaults.imageFrame?.y ?? fallbackPreviewDefaults.imageFrame.y,
    },
    imageScale: 1,
    imageFrame: previewDefaults.imageFrame || fallbackPreviewDefaults.imageFrame,
    imageCrop: { x: 0, y: 0, zoom: 1 },
    artworkEffect: 'original',
    artworkBorderColor: framePalette[0],
  };
};

function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const studioRef = useRef(null);
  const { user } = useAuth();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [selectedOptions, setSelectedOptions] = useState({});
  const [customization, setCustomization] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState('image');
  const [customImageFile, setCustomImageFile] = useState(null);
  const [customState, setCustomState] = useState({ sending: false, message: '', type: '' });
  const [customRequest, setCustomRequest] = useState(customizationRequestDefaults);

  useEffect(() => {
    let ignore = false;

    const loadProduct = async () => {
      const response = await fetchProduct(slug);
      if (ignore) {
        return;
      }

      setProduct(response.product);
      setActiveImage(response.product.images[0] || '');
      setSelectedOptions(buildInitialSelectedOptions(response.product));
      setCustomization(buildInitialCustomization(response.product));
      setCustomImageFile(null);
      setCustomState({ sending: false, message: '', type: '' });
      setCustomRequest({
        ...customizationRequestDefaults,
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });

      const relatedResponse = await fetchProducts({
        collection: response.product.collection,
        limit: 8,
      });

      if (!ignore) {
        setRelated(
          relatedResponse.products
            .filter((item) => item.slug !== response.product.slug)
            .slice(0, 4),
        );
      }
    };

    loadProduct();

    return () => {
      ignore = true;
    };
  }, [slug, user]);

  useEffect(() => {
    if (!customImageFile) {
      return undefined;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setCustomization((previous) =>
        previous
          ? {
              ...previous,
              imageSrc: typeof reader.result === 'string' ? reader.result : '',
            }
          : previous,
      );
    };

    reader.readAsDataURL(customImageFile);

    return () => {
      reader.abort();
    };
  }, [customImageFile]);

  const optionGroups = product?.customizationConfig?.optionGroups || [];
  const textPalette = product?.customizationConfig?.textPalette || fallbackTextPalette;
  const framePalette = product?.customizationConfig?.framePalette || fallbackFramePalette;
  const artworkEffects = product?.customizationConfig?.artworkEffects || [
    'original',
    'mono',
    'warm',
    'cool',
    'pop',
  ];
  const optionSummary = formatSelectedOptions(selectedOptions, {
    size: product?.sizes?.[0] || 'One Size',
    color: product?.colors?.[0] || 'Default',
  });
  const hasCustomizationChanges = Boolean(customization?.text?.trim() || customization?.imageSrc);

  const updateOption = (key, value) => {
    setSelectedOptions((previous) => ({ ...previous, [key]: value }));
  };

  const handleArtworkFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setCustomImageFile(file);

    if (!file) {
      setCustomization((previous) => (previous ? { ...previous, imageSrc: '' } : previous));
    }
  };

  const updateCustomization = (patch) => {
    setCustomization((previous) => (previous ? { ...previous, ...patch } : previous));
  };

  const updateImageFrame = (patch) => {
    setCustomization((previous) =>
      previous
        ? {
            ...previous,
            imagePosition: {
              x: patch.x ?? previous.imagePosition.x,
              y: patch.y ?? previous.imagePosition.y,
            },
            imageFrame: {
              ...previous.imageFrame,
              ...patch,
            },
          }
        : previous,
    );
  };

  const handleLayerMove = (layer, position) => {
    if (layer === 'image') {
      updateImageFrame(position);
      return;
    }

    updateCustomization({
      textPosition: {
        x: position.x,
        y: position.y,
      },
    });
  };

  const handleAddBaseToCart = () => {
    addToCart(product, {
      selectedOptions,
      size: selectedOptions.size,
      color: selectedOptions.color,
    });
  };

  const handleBuyNow = () => {
    handleAddBaseToCart();
    navigate('/checkout');
  };

  const handleAddCustomizedToCart = () => {
    addToCart(product, {
      selectedOptions,
      size: selectedOptions.size,
      color: selectedOptions.color,
      previewImage: activeImage,
      customization,
    });
  };

  const handleCustomizationRequestChange = (event) => {
    const { name, value } = event.target;
    setCustomRequest((previous) => ({ ...previous, [name]: value }));
  };

  const handleCustomizationSubmit = async (event) => {
    event.preventDefault();
    setCustomState({ sending: true, message: '', type: '' });

    const formData = new FormData();
    formData.append('name', customRequest.name);
    formData.append('email', customRequest.email);
    formData.append('phone', customRequest.phone);
    formData.append('productType', product.collection);
    formData.append('productName', product.name);
    formData.append('size', selectedOptions.size || '');
    formData.append('color', selectedOptions.color || '');
    formData.append('fabric', selectedOptions.fibre || customRequest.fabric);
    formData.append('fitNotes', customRequest.fitNotes);
    formData.append(
      'description',
      `${customRequest.description}\n\nSelected options: ${optionSummary}`.trim(),
    );

    if (customImageFile) {
      formData.append('inspirationImage', customImageFile);
    }

    try {
      const response = await submitCustomRequest(formData);
      setCustomState({
        sending: false,
        type: 'success',
        message: `Customization request submitted. Reference ${response.request.reference} has been created.`,
      });
      setCustomRequest({
        ...customizationRequestDefaults,
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });
    } catch (error) {
      setCustomState({
        sending: false,
        type: 'error',
        message: error.response?.data?.message || 'Unable to submit customization request.',
      });
    }
  };

  const scrollToStudio = () => {
    studioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const layerHint =
    selectedLayer === 'text'
      ? 'Drag the text directly on the preview or fine-tune it below.'
      : 'Drag the uploaded artwork directly on the preview or fine-tune it below.';

  const previewTitle =
    product?.productType === 'pillow'
      ? 'Live pillow preview'
      : product?.productType === 'blanket'
        ? 'Live blanket preview'
        : product?.productType === 'mug'
          ? 'Live mug preview'
          : product?.productType === 'frame'
            ? 'Live frame preview'
            : 'Live product preview';

  const activeLayerBorderClass =
    selectedLayer === 'image' ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100' : 'border-amber-200/30 bg-amber-200/10 text-amber-100';

  if (!product || !customization) {
    return <div className="section-shell py-20 text-stone-400">Loading product...</div>;
  }

  return (
    <div className="section-shell py-10">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[34px] border border-white/10 bg-white/5">
            <img src={activeImage} alt={product.name} className="aspect-[4/5] w-full object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {product.images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(image)}
                className={`overflow-hidden rounded-[22px] border ${
                  activeImage === image ? 'border-amber-200/50' : 'border-white/10'
                }`}
              >
                <img src={image} alt={`${product.name} ${index + 1}`} className="aspect-square w-full object-cover" />
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
            <span>Ready for live customization</span>
          </div>
          <p className="mt-5 text-3xl font-bold text-stone-100">{formatCurrency(product.price)}</p>
          <p className="mt-5 text-base leading-7 text-stone-400">{product.description}</p>

          <div className="mt-8 space-y-6">
            {optionGroups.map((group) => (
              <div key={group.key}>
                <p className="mb-3 text-sm text-stone-400">{group.label}</p>
                <div className="flex flex-wrap gap-3">
                  {group.values.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateOption(group.key, value)}
                      className={`rounded-full border px-4 py-2 text-sm ${
                        selectedOptions[group.key] === value
                          ? 'border-cyan-300/60 bg-cyan-300/10 text-cyan-100'
                          : 'border-white/10 bg-white/5 text-stone-300'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-stone-300">
            Selected: <span className="text-stone-100">{optionSummary}</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={handleAddBaseToCart}
              className="inline-flex items-center gap-3 rounded-full bg-amber-200 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black"
            >
              <ShoppingBag size={16} />
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-stone-100"
            >
              Buy Now
            </button>
            <button
              type="button"
              onClick={scrollToStudio}
              className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-100"
            >
              <Scissors size={16} />
              Open Live Editor
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-stone-100"
            >
              <Heart size={16} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
              Wishlist
            </button>
          </div>
        </div>
      </div>

      <section ref={studioRef} className="mt-12 scroll-mt-32">
        <div className="luxury-panel rounded-[34px] border border-white/10 p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100">
                <Sparkles size={14} />
                Real-Time Customizer
              </div>
              <h2 className="headline-font mt-5 text-4xl font-semibold text-stone-100">{previewTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-400">
                Upload your artwork, drag it into place, resize it, crop it, and change colours while the
                product preview updates instantly.
              </p>
            </div>
            <div className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.28em] ${activeLayerBorderClass}`}>
              {layerHint}
            </div>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4">
              <CustomizedProductPreview
                imageSrc={activeImage}
                productName={product.name}
                customization={customization}
                interactive
                selectedLayer={selectedLayer}
                onSelectLayer={setSelectedLayer}
                onMoveLayer={handleLayerMove}
                className="aspect-square rounded-[30px] border border-white/10 bg-black"
                imageClassName="h-full w-full object-cover"
              />
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-stone-300">
                Current selection: <span className="text-stone-100">{optionSummary}</span>
              </div>
              {product.customizationConfig?.notes?.length ? (
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-stone-300">
                  {product.customizationConfig.notes.map((note) => (
                    <p key={note} className="leading-6">
                      {note}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedLayer('image')}
                  className={`rounded-[22px] border px-4 py-3 text-left text-sm ${
                    selectedLayer === 'image'
                      ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100'
                      : 'border-white/10 bg-white/5 text-stone-300'
                  }`}
                >
                  Edit Artwork
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLayer('text')}
                  className={`rounded-[22px] border px-4 py-3 text-left text-sm ${
                    selectedLayer === 'text'
                      ? 'border-amber-200/40 bg-amber-200/10 text-amber-100'
                      : 'border-white/10 bg-white/5 text-stone-300'
                  }`}
                >
                  Edit Text
                </button>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-stone-100">Artwork Upload</p>
                <label className="mt-4 block rounded-[24px] border border-dashed border-white/15 bg-black/20 p-5">
                  <div className="flex flex-col items-center justify-center gap-3 text-center text-sm text-stone-400">
                    <ImagePlus size={24} className="text-cyan-300" />
                    <p>{customImageFile ? customImageFile.name : 'Upload JPG, PNG, or WEBP artwork'}</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleArtworkFileChange}
                      className="block w-full text-sm text-stone-400 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-semibold file:text-black"
                    />
                  </div>
                </label>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomImageFile(null);
                      setCustomization((previous) => (previous ? { ...previous, imageSrc: '' } : previous));
                    }}
                    className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-stone-300"
                  >
                    Remove Artwork
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomization((previous) =>
                        previous
                          ? {
                              ...previous,
                              imageCrop: { x: 0, y: 0, zoom: 1 },
                              imageFrame: {
                                ...previous.imageFrame,
                                width: buildInitialCustomization(product).imageFrame.width,
                                height: buildInitialCustomization(product).imageFrame.height,
                              },
                            }
                          : previous,
                      )
                    }
                    className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-stone-300"
                  >
                    Reset Image Fit
                  </button>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold text-stone-100">Artwork Controls</p>
                  <div className="mt-4 space-y-4 text-sm text-stone-300">
                    <label className="block space-y-2">
                      <span>Artwork Width</span>
                      <input
                        type="range"
                        min="16"
                        max="72"
                        value={customization.imageFrame.width}
                        onChange={(event) =>
                          updateImageFrame({ width: Number(event.target.value) })
                        }
                        className="w-full"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span>Artwork Height</span>
                      <input
                        type="range"
                        min="16"
                        max="72"
                        value={customization.imageFrame.height}
                        onChange={(event) =>
                          updateImageFrame({ height: Number(event.target.value) })
                        }
                        className="w-full"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span>Crop Zoom</span>
                      <input
                        type="range"
                        min="1"
                        max="2.8"
                        step="0.1"
                        value={customization.imageCrop.zoom}
                        onChange={(event) =>
                          updateCustomization({
                            imageScale: Number(event.target.value),
                            imageCrop: {
                              ...customization.imageCrop,
                              zoom: Number(event.target.value),
                            },
                          })
                        }
                        className="w-full"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span>Crop Left / Right</span>
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        value={customization.imageCrop.x}
                        onChange={(event) =>
                          updateCustomization({
                            imageCrop: {
                              ...customization.imageCrop,
                              x: Number(event.target.value),
                            },
                          })
                        }
                        className="w-full"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span>Crop Up / Down</span>
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        value={customization.imageCrop.y}
                        onChange={(event) =>
                          updateCustomization({
                            imageCrop: {
                              ...customization.imageCrop,
                              y: Number(event.target.value),
                            },
                          })
                        }
                        className="w-full"
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold text-stone-100">Text & Colour Controls</p>
                  <div className="mt-4 space-y-4 text-sm text-stone-300">
                    <label className="block space-y-2">
                      <span>Custom Text</span>
                      <input
                        type="text"
                        value={customization.text}
                        onChange={(event) => updateCustomization({ text: event.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-amber-200/40"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span>Text Size</span>
                      <input
                        type="range"
                        min="18"
                        max="56"
                        value={customization.textSize}
                        onChange={(event) =>
                          updateCustomization({ textSize: Number(event.target.value) })
                        }
                        className="w-full"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span>Text Horizontal Position</span>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={customization.textPosition.x}
                        onChange={(event) =>
                          updateCustomization({
                            textPosition: {
                              ...customization.textPosition,
                              x: Number(event.target.value),
                            },
                          })
                        }
                        className="w-full"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span>Text Vertical Position</span>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={customization.textPosition.y}
                        onChange={(event) =>
                          updateCustomization({
                            textPosition: {
                              ...customization.textPosition,
                              y: Number(event.target.value),
                            },
                          })
                        }
                        className="w-full"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold text-stone-100">Text Colours</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {textPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateCustomization({ textColor: color })}
                        className={`h-11 w-11 rounded-full border-2 ${
                          customization.textColor === color ? 'border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Text color ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold text-stone-100">Artwork Border Colours</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {framePalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateCustomization({ artworkBorderColor: color })}
                        className={`h-11 w-11 rounded-full border-2 ${
                          customization.artworkBorderColor === color
                            ? 'border-white'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Artwork border ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-stone-100">Artwork Tone</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {artworkEffects.map((effect) => (
                    <button
                      key={effect}
                      type="button"
                      onClick={() => updateCustomization({ artworkEffect: effect })}
                      className={`rounded-full border px-4 py-2 text-sm uppercase tracking-[0.2em] ${
                        customization.artworkEffect === effect
                          ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100'
                          : 'border-white/10 bg-black/20 text-stone-300'
                      }`}
                    >
                      {effect}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={handleAddCustomizedToCart}
                  className="inline-flex items-center gap-3 rounded-full bg-amber-200 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black"
                >
                  <ShoppingBag size={16} />
                  {hasCustomizationChanges ? 'Add Customized to Cart' : 'Add Current Design to Cart'}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-stone-100"
                >
                  Buy Base Product
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="luxury-panel rounded-[34px] border border-white/10 p-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100">
            <Scissors size={14} />
            Extra Custom Request
          </div>
          <h2 className="headline-font mt-5 text-4xl font-semibold text-stone-100">
            Need more changes than the live editor allows?
          </h2>
          <p className="mt-4 text-base leading-7 text-stone-400">
            Use this form for special print notes, blanket fibre preferences, pillow instructions, or any
            bigger request that needs manual review from the team.
          </p>
          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-stone-300">
            Selected options: <span className="text-stone-100">{optionSummary}</span>
          </div>
        </div>

        {!user ? (
          <div className="luxury-panel rounded-[34px] border border-white/10 p-8">
            <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300">Customer Login Required</p>
            <h3 className="headline-font mt-4 text-3xl font-semibold text-stone-100">
              Sign in before submitting customization details.
            </h3>
            <p className="mt-4 text-base leading-7 text-stone-400">
              Customers now need an account with password plus OTP verification before sending manual
              customization requests.
            </p>
            <Link
              to={`/login?redirect=${encodeURIComponent(`/product/${slug}`)}`}
              className="mt-6 inline-flex rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black"
            >
              Login / Sign Up
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleCustomizationSubmit}
            className="luxury-panel rounded-[34px] border border-white/10 p-8"
          >
            <div className="mb-6 rounded-[22px] border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
              Signed in as {user.name}. Your customer account details are being used for this request.
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-stone-400">Name</span>
                <input
                  required
                  name="name"
                  value={customRequest.name}
                  onChange={handleCustomizationRequestChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-stone-400">Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  value={customRequest.email}
                  onChange={handleCustomizationRequestChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-stone-400">Phone</span>
                <input
                  required
                  name="phone"
                  value={customRequest.phone}
                  onChange={handleCustomizationRequestChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-stone-400">
                  {selectedOptions.fibre ? 'Additional Fibre / Fabric Notes' : 'Fabric / Material Notes'}
                </span>
                <input
                  name="fabric"
                  value={customRequest.fabric}
                  onChange={handleCustomizationRequestChange}
                  placeholder="Microfiber, Sherpa, Coral fleece, premium cotton"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm text-stone-400">Fit / Size Notes</span>
                <textarea
                  name="fitNotes"
                  value={customRequest.fitNotes}
                  onChange={handleCustomizationRequestChange}
                  rows="3"
                  placeholder="Mention exact pillow size, blanket sizing needs, or extra placement requests."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm text-stone-400">Special Customization Notes</span>
                <textarea
                  required
                  name="description"
                  value={customRequest.description}
                  onChange={handleCustomizationRequestChange}
                  rows="4"
                  placeholder="Describe extra artwork directions, print placement, packaging, or anything else you need."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40"
                />
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
              {customState.sending ? 'Sending Request' : 'Request Manual Customization'}
            </button>
          </form>
        )}
      </section>

      <section className="mt-14">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">Related Pieces</p>
          <h2 className="headline-font mt-3 text-4xl font-semibold text-stone-100">Continue the look.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {related.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              accent={item.collection === 'streetwear' || item.collection === 'modern' ? 'neon' : 'gold'}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProductPage;
