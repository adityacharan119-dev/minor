const encodeSvg = (value) => `data:image/svg+xml;utf8,${encodeURIComponent(value)}`;

const collectionThemes = {
  traditional: { bg: '#120d08', panel: '#24180c', accent: '#d4af37', text: '#f7e2ac' },
  modern: { bg: '#0b0d11', panel: '#141922', accent: '#7dd3fc', text: '#f3f4f6' },
  streetwear: { bg: '#080a0e', panel: '#111827', accent: '#22d3ee', text: '#f5f5f5' },
  jewelry: { bg: '#130f09', panel: '#26190d', accent: '#f1c75b', text: '#fff3cd' },
};

const streetwearThemes = {
  tee: { garment: '#171a1f', shadow: '#0b0e13', highlight: '#2b313a', ink: '#22d3ee' },
  hoodie: { garment: '#14171c', shadow: '#090c10', highlight: '#29313a', ink: '#22d3ee' },
};

const catalogAsset = (filename) => `/catalog-assets/${filename}`;

const realAssetImages = {
  lehenga: catalogAsset('lehenga.png'),
  sherwani: catalogAsset('sherwani.png'),
  kurta: catalogAsset('kurta.png'),
  ethnicJewelry: catalogAsset('ethnic_jewelry.png'),
  blazer: catalogAsset('modern_blazer.png'),
};

const curatedImages = {
  modernGown: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
  modernDress: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop',
  modernPendant: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=1200&auto=format&fit=crop',
  modernOutfit: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
  voidTee: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop',
  urbanGridTee: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop',
  tokyoStreetTee: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
  brokenTextTee: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
  stayHungryTee: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1200&auto=format&fit=crop',
  vintageWashTee: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=1200&auto=format&fit=crop',
  cosmicDriftTee: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
  barcodeHumanTee: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
  graffitiStreetTee: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop',
  flameStreetTee: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop',
  neoStreetHoodie: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
  cyberDistrictHoodie: 'https://images.unsplash.com/photo-1506629905607-d9b1c7f6f1f4?q=80&w=1200&auto=format&fit=crop',
  angelWingHoodie: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
  urbanShadowHoodie: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=1200&auto=format&fit=crop',
  eliteMinimalHoodie: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop',
  streetFlameHoodie: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1200&auto=format&fit=crop',
  cosmicHoodie: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop',
  speedDivisionHoodie: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=1200&auto=format&fit=crop',
  vintageWashHoodie: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?q=80&w=1200&auto=format&fit=crop',
  customNameHoodie: 'https://images.unsplash.com/photo-1524255684952-d7185b509571?q=80&w=1200&auto=format&fit=crop',
  sovereignChain: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop',
  crestRing: 'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?q=80&w=1200&auto=format&fit=crop',
  orbitBracelet: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1200&auto=format&fit=crop',
  noorPendant: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=1200&auto=format&fit=crop',
  kundanSet: catalogAsset('ethnic_jewelry.png'),
  linearEarrings: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1200&auto=format&fit=crop',
  urbanSnapbackCap: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1200&auto=format&fit=crop',
  neonGlowCap: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?q=80&w=1200&auto=format&fit=crop',
  minimalBeanie: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop',
};

const getSilhouette = (subcategory, name) => {
  const value = `${subcategory} ${name}`.toLowerCase();
  if (value.includes('lehenga')) return 'lehenga';
  if (value.includes('sherwani')) return 'sherwani';
  if (value.includes('kurta')) return 'kurta';
  if (value.includes('dress') || value.includes('gown')) return 'dress';
  if (value.includes('blazer') || value.includes('suit')) return 'blazer';
  if (value.includes('hoodie')) return 'hoodie';
  if (value.includes('tee') || value.includes('t-shirt')) return 'tee';
  if (value.includes('cap') || value.includes('beanie')) return 'cap';
  if (value.includes('chain')) return 'chain';
  if (value.includes('ring')) return 'ring';
  if (value.includes('bracelet')) return 'bracelet';
  if (value.includes('pendant') || value.includes('necklace')) return 'pendant';
  if (value.includes('earring')) return 'earrings';
  return 'fashion';
};

const drawSilhouette = (silhouette, accent, panel) => {
  switch (silhouette) {
    case 'lehenga':
      return `
        <circle cx="450" cy="240" r="70" fill="${accent}" fill-opacity="0.18"/>
        <rect x="405" y="290" width="90" height="120" rx="24" fill="${accent}" fill-opacity="0.24"/>
        <path d="M300 415 C350 350 550 350 600 415 L690 835 C575 905 325 905 210 835 Z" fill="${accent}" fill-opacity="0.26" stroke="${accent}" stroke-width="5"/>
        <path d="M255 530 C355 480 550 480 645 530" stroke="${panel}" stroke-width="8" stroke-linecap="round"/>
      `;
    case 'sherwani':
      return `
        <circle cx="450" cy="230" r="72" fill="${accent}" fill-opacity="0.18"/>
        <path d="M330 320 L570 320 L620 835 L280 835 Z" fill="${accent}" fill-opacity="0.24" stroke="${accent}" stroke-width="5"/>
        <path d="M450 320 L450 835" stroke="${panel}" stroke-width="8"/>
        <circle cx="450" cy="420" r="8" fill="${panel}"/>
        <circle cx="450" cy="505" r="8" fill="${panel}"/>
        <circle cx="450" cy="590" r="8" fill="${panel}"/>
      `;
    case 'kurta':
      return `
        <circle cx="450" cy="230" r="72" fill="${accent}" fill-opacity="0.18"/>
        <path d="M315 325 L585 325 L560 760 L340 760 Z" fill="${accent}" fill-opacity="0.24" stroke="${accent}" stroke-width="5"/>
        <rect x="385" y="325" width="130" height="110" rx="20" fill="${accent}" fill-opacity="0.14"/>
        <path d="M450 350 L450 450" stroke="${panel}" stroke-width="8"/>
      `;
    case 'dress':
      return `
        <circle cx="450" cy="240" r="70" fill="${accent}" fill-opacity="0.18"/>
        <path d="M360 315 L540 315 L620 835 C535 900 365 900 280 835 Z" fill="${accent}" fill-opacity="0.24" stroke="${accent}" stroke-width="5"/>
        <path d="M345 400 C385 365 515 365 555 400" stroke="${panel}" stroke-width="8" stroke-linecap="round"/>
      `;
    case 'blazer':
      return `
        <circle cx="450" cy="235" r="70" fill="${accent}" fill-opacity="0.18"/>
        <path d="M320 320 L580 320 L620 770 L280 770 Z" fill="${accent}" fill-opacity="0.22" stroke="${accent}" stroke-width="5"/>
        <path d="M380 320 L450 470 L520 320" fill="${panel}" fill-opacity="0.35"/>
        <path d="M450 470 L450 770" stroke="${panel}" stroke-width="8"/>
      `;
    case 'hoodie':
      return `
        <path d="M365 210 C385 155 515 155 535 210 L560 285 C540 315 500 335 450 335 C400 335 360 315 340 285 Z" fill="${accent}" fill-opacity="0.22" stroke="${accent}" stroke-width="5"/>
        <path d="M280 355 C340 315 560 315 620 355 L650 770 C590 830 310 830 250 770 Z" fill="${accent}" fill-opacity="0.22" stroke="${accent}" stroke-width="5"/>
        <rect x="380" y="520" width="140" height="110" rx="26" fill="${panel}" fill-opacity="0.35"/>
      `;
    case 'tee':
      return `
        <path d="M305 330 C360 285 540 285 595 330 L655 440 L565 490 L540 780 C485 805 415 805 360 780 L335 490 L245 440 Z" fill="${accent}" fill-opacity="0.22" stroke="${accent}" stroke-width="5"/>
        <path d="M395 360 C420 340 480 340 505 360" stroke="${panel}" stroke-width="8" stroke-linecap="round"/>
      `;
    case 'cap':
      return `
        <path d="M250 400 C250 350 300 300 450 300 C600 300 650 350 650 400 L650 450 L250 450 Z" fill="${accent}" fill-opacity="0.22" stroke="${accent}" stroke-width="5"/>
        <ellipse cx="450" cy="375" rx="200" ry="75" fill="${panel}" fill-opacity="0.35"/>
      `;
    case 'chain':
      return `
        <circle cx="450" cy="370" r="190" fill="none" stroke="${accent}" stroke-width="24" stroke-dasharray="14 16"/>
        <circle cx="450" cy="370" r="120" fill="none" stroke="${accent}" stroke-width="14" stroke-opacity="0.55"/>
      `;
    case 'ring':
      return `
        <ellipse cx="450" cy="520" rx="170" ry="120" fill="none" stroke="${accent}" stroke-width="28"/>
        <rect x="390" y="305" width="120" height="110" rx="28" fill="${accent}" fill-opacity="0.3" stroke="${accent}" stroke-width="5"/>
      `;
    case 'bracelet':
      return `
        <ellipse cx="450" cy="520" rx="220" ry="160" fill="none" stroke="${accent}" stroke-width="24"/>
        <ellipse cx="450" cy="520" rx="150" ry="95" fill="none" stroke="${accent}" stroke-width="12" stroke-opacity="0.5"/>
      `;
    case 'pendant':
      return `
        <path d="M450 225 C310 225 250 330 250 430" fill="none" stroke="${accent}" stroke-width="16"/>
        <path d="M450 225 C590 225 650 330 650 430" fill="none" stroke="${accent}" stroke-width="16"/>
        <circle cx="450" cy="575" r="120" fill="${accent}" fill-opacity="0.22" stroke="${accent}" stroke-width="8"/>
      `;
    case 'earrings':
      return `
        <circle cx="340" cy="320" r="42" fill="${accent}" fill-opacity="0.25"/>
        <circle cx="560" cy="320" r="42" fill="${accent}" fill-opacity="0.25"/>
        <path d="M340 360 L290 530 L340 690 L390 530 Z" fill="${accent}" fill-opacity="0.24" stroke="${accent}" stroke-width="5"/>
        <path d="M560 360 L510 530 L560 690 L610 530 Z" fill="${accent}" fill-opacity="0.24" stroke="${accent}" stroke-width="5"/>
      `;
    default:
      return `
        <rect x="250" y="250" width="400" height="520" rx="42" fill="${accent}" fill-opacity="0.22" stroke="${accent}" stroke-width="5"/>
      `;
  }
};

const createStreetwearMockup = ({ name, subcategory, variant = 0 }) => {
  const isHoodie = `${subcategory} ${name}`.toLowerCase().includes('hoodie');
  const theme = isHoodie ? streetwearThemes.hoodie : streetwearThemes.tee;
  const artwork = name
    .replace('Hoodie', '')
    .replace('Tee', '')
    .trim()
    .toUpperCase()
    .slice(0, 18);

  const garment = isHoodie
    ? `
      <defs>
        <linearGradient id="hoodieBody${variant}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${theme.highlight}"/>
          <stop offset="45%" stop-color="${theme.garment}"/>
          <stop offset="100%" stop-color="${theme.shadow}"/>
        </linearGradient>
      </defs>
      <path d="M345 200 C375 150 525 150 555 200 L590 285 C565 320 515 345 450 345 C385 345 335 320 310 285 Z" fill="url(#hoodieBody${variant})"/>
      <path d="M250 355 C320 305 580 305 650 355 L690 815 C620 865 280 865 210 815 Z" fill="url(#hoodieBody${variant})"/>
      <path d="M332 438 C368 418 532 418 568 438" stroke="${theme.highlight}" stroke-width="7" stroke-linecap="round" opacity="0.55"/>
      <rect x="370" y="545" width="160" height="120" rx="26" fill="${theme.shadow}" opacity="0.82"/>
      <path d="M450 248 L418 308 L482 308 Z" fill="${theme.shadow}" opacity="0.8"/>
      <path d="M355 374 L295 505 L355 535 L378 415 Z" fill="${theme.shadow}" opacity="0.35"/>
      <path d="M545 374 L605 505 L545 535 L522 415 Z" fill="${theme.shadow}" opacity="0.35"/>
      <rect x="300" y="710" width="300" height="18" rx="9" fill="${theme.shadow}" opacity="0.6"/>
      <text x="450" y="468" text-anchor="middle" fill="${theme.ink}" font-size="34" font-family="Arial" font-weight="700" letter-spacing="4">${artwork}</text>
    `
    : `
      <defs>
        <linearGradient id="teeBody${variant}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${theme.highlight}"/>
          <stop offset="45%" stop-color="${theme.garment}"/>
          <stop offset="100%" stop-color="${theme.shadow}"/>
        </linearGradient>
      </defs>
      <path d="M300 330 C355 280 545 280 600 330 L670 455 L575 510 L552 790 C490 820 410 820 348 790 L325 510 L230 455 Z" fill="url(#teeBody${variant})"/>
      <path d="M390 330 C410 308 490 308 510 330" stroke="${theme.shadow}" stroke-width="8" stroke-linecap="round"/>
      <path d="M340 398 L285 500 L348 520 L358 428 Z" fill="${theme.shadow}" opacity="0.3"/>
      <path d="M560 398 L615 500 L552 520 L542 428 Z" fill="${theme.shadow}" opacity="0.3"/>
      <path d="M380 550 C410 530 490 530 520 550" stroke="${theme.highlight}" stroke-width="7" stroke-linecap="round" opacity="0.45"/>
      <text x="450" y="465" text-anchor="middle" fill="${theme.ink}" font-size="32" font-family="Arial" font-weight="700" letter-spacing="4">${artwork}</text>
      <text x="450" y="515" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-size="16" font-family="Arial" letter-spacing="5">${subcategory.toUpperCase()}</text>
    `;

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1100">
      <defs>
        <linearGradient id="bgStreet${variant}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#05070b"/>
          <stop offset="100%" stop-color="#020304"/>
        </linearGradient>
        <radialGradient id="streetGlow${variant}" cx="${72 - variant * 7}%" cy="${18 + variant * 4}%" r="44%">
          <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="900" height="1100" fill="url(#bgStreet${variant})"/>
      <rect x="86" y="86" width="728" height="928" rx="52" fill="#0b1017" stroke="rgba(255,255,255,0.08)" stroke-width="3"/>
      <circle cx="${690 - variant * 20}" cy="${178 + variant * 10}" r="${138 + variant * 18}" fill="url(#streetGlow${variant})"/>
      <text x="98" y="126" fill="rgba(255,255,255,0.48)" font-size="24" font-family="Arial" letter-spacing="8">${subcategory.toUpperCase()}</text>
      ${garment}
      <text x="100" y="910" fill="#f5f5f5" font-size="52" font-family="Georgia" font-weight="700">${name}</text>
      <text x="100" y="960" fill="rgba(255,255,255,0.4)" font-size="22" font-family="Arial" letter-spacing="4">MYCRAFT</text>
    </svg>
  `);
};

const createProductImage = ({ name, collection, subcategory, variant = 0 }) => {
  const theme = collectionThemes[collection];
  const silhouette = getSilhouette(subcategory, name);
  const shift = variant * 18;
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1100">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${theme.bg}"/>
          <stop offset="100%" stop-color="#040404"/>
        </linearGradient>
        <radialGradient id="glow" cx="${70 - variant * 8}%" cy="${20 + variant * 6}%" r="50%">
          <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.34"/>
          <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="900" height="1100" fill="url(#bg)"/>
      <rect x="${92 + shift}" y="${82 + shift}" width="716" height="936" rx="48" fill="${theme.panel}" fill-opacity="0.42" stroke="rgba(255,255,255,0.08)" stroke-width="3"/>
      <circle cx="${700 - shift}" cy="${170 + shift}" r="${165 + variant * 20}" fill="url(#glow)"/>
      <text x="90" y="120" fill="rgba(255,255,255,0.52)" font-size="25" font-family="Arial" letter-spacing="8">${subcategory.toUpperCase()}</text>
      ${drawSilhouette(silhouette, theme.accent, theme.panel)}
      <text x="90" y="920" fill="${theme.text}" font-size="56" font-family="Georgia" font-weight="700">${name}</text>
      <text x="90" y="972" fill="rgba(255,255,255,0.46)" font-size="24" font-family="Arial" letter-spacing="4">MYCRAFT</text>
    </svg>
  `);
};

const createProductImages = (product) => {
  if (product.collection === 'streetwear') {
    const usesGenericStudioCards = /cap|beanie/i.test(`${product.subcategory} ${product.name}`);
    const generated = usesGenericStudioCards
      ? [
          createProductImage({ ...product, variant: 0 }),
          createProductImage({ ...product, variant: 1 }),
          createProductImage({ ...product, variant: 2 }),
        ]
      : [
          createStreetwearMockup({ ...product, variant: 0 }),
          createStreetwearMockup({ ...product, variant: 1 }),
          createStreetwearMockup({ ...product, variant: 2 }),
        ];

    if (product.primaryImage) {
      return [product.primaryImage, generated[1], generated[2]];
    }

    return generated;
  }

  const generated = [
    createProductImage({ ...product, variant: 0 }),
    createProductImage({ ...product, variant: 1 }),
    createProductImage({ ...product, variant: 2 }),
  ];

  if (product.primaryImage) {
    return [product.primaryImage, generated[1], generated[2]];
  }

  return generated;
};

const makeProduct = ({
  id,
  name,
  collection,
  subcategory,
  price,
  rating,
  colors,
  sizes,
  description,
  featured = false,
  primaryImage = '',
}) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const base = {
    id,
    slug,
    name,
    collection,
    subcategory,
    price,
    rating,
    colors,
    sizes,
    featured,
    description,
    isCustomizable: collection !== 'jewelry',
    primaryImage,
  };

  return {
    ...base,
    images: createProductImages(base),
  };
};

const seedProducts = [
  makeProduct({ id: 'p1', name: 'Royal Sunehri Lehenga', collection: 'traditional', subcategory: 'Designer Lehengas', price: 18999, rating: 4.9, colors: ['Gold', 'Maroon', 'Ivory'], sizes: ['XS', 'S', 'M', 'L', 'XL'], featured: true, description: 'Couture lehenga with handcrafted zardozi, layered can-can volume, and bridal finishing for premium ceremonies.', primaryImage: realAssetImages.lehenga }),
  makeProduct({ id: 'p2', name: 'Noor Wedding Sherwani', collection: 'traditional', subcategory: 'Sherwanis', price: 14999, rating: 4.8, colors: ['Ivory', 'Sand', 'Black'], sizes: ['S', 'M', 'L', 'XL'], description: 'Structured sherwani with tonal embroidery, luxe lining, and formal wedding silhouette.', primaryImage: realAssetImages.sherwani }),
  makeProduct({ id: 'p3', name: 'Heritage Silk Kurta Set', collection: 'traditional', subcategory: 'Kurtas', price: 5499, rating: 4.7, colors: ['Onyx', 'Olive', 'Stone'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], description: 'Premium silk-blend kurta set tuned for festive evenings and understated ceremonial styling.', primaryImage: realAssetImages.kurta }),
  makeProduct({ id: 'p4', name: 'Temple Bridal Necklace', collection: 'traditional', subcategory: 'Ethnic Jewelry', price: 8999, rating: 5.0, colors: ['Gold'], sizes: ['One Size'], featured: true, description: 'Layered bridal necklace with temple-inspired motifs and ceremonial gold finish.', primaryImage: realAssetImages.ethnicJewelry }),
  makeProduct({ id: 'p5', name: 'Midnight Drape Gown', collection: 'modern', subcategory: 'Modern Dresses', price: 8999, rating: 4.8, colors: ['Black', 'Graphite'], sizes: ['XS', 'S', 'M', 'L'], featured: true, description: 'Fluid modern gown with high-sheen drape, clean neckline, and evening-house polish.', primaryImage: curatedImages.modernGown }),
  makeProduct({ id: 'p6', name: 'Architect Blazer Set', collection: 'modern', subcategory: 'Suits and Blazers', price: 10999, rating: 4.9, colors: ['Charcoal', 'Steel'], sizes: ['S', 'M', 'L', 'XL'], description: 'Sharp blazer with sculpted shoulder line and relaxed trouser pairing for formal modern dressing.', primaryImage: realAssetImages.blazer }),
  makeProduct({ id: 'p7', name: 'Minimal Orbit Pendant', collection: 'modern', subcategory: 'Minimal Jewelry', price: 3499, rating: 4.6, colors: ['Silver', 'Gold'], sizes: ['One Size'], description: 'Minimal pendant designed to complement tailored looks and daily luxury layering.', primaryImage: curatedImages.modernPendant }),
  makeProduct({ id: 'p8', name: 'Studio Satin Dress', collection: 'modern', subcategory: 'Designer Outfits', price: 7799, rating: 4.7, colors: ['Pearl', 'Jet'], sizes: ['XS', 'S', 'M', 'L'], description: 'Satin-led designer dress with refined movement and clean contouring through the waist.', primaryImage: curatedImages.modernOutfit }),
  makeProduct({ id: 'p9', name: 'Void Minimal Tee', collection: 'streetwear', subcategory: 'Oversized T-shirts', price: 1499, rating: 4.8, colors: ['Black', 'Bone'], sizes: ['M', 'L', 'XL', 'XXL'], featured: true, description: 'Heavyweight oversized tee with minimal front mark and premium washed hand-feel.', primaryImage: curatedImages.voidTee }),
  makeProduct({ id: 'p10', name: 'Urban Grid Tee', collection: 'streetwear', subcategory: 'Graphic Tees', price: 1599, rating: 4.8, colors: ['Black', 'Slate'], sizes: ['M', 'L', 'XL', 'XXL'], description: 'Streetwear tee with sharp gridded graphic system and relaxed drop-shoulder block.', primaryImage: curatedImages.urbanGridTee }),
  makeProduct({ id: 'p11', name: 'Tokyo Street Tee', collection: 'streetwear', subcategory: 'Graphic Tees', price: 1699, rating: 4.9, colors: ['Black', 'Stone'], sizes: ['M', 'L', 'XL', 'XXL'], description: 'Oversized tee with urban typography and night-city visual energy.', primaryImage: curatedImages.tokyoStreetTee }),
  makeProduct({ id: 'p12', name: 'Broken Text Tee', collection: 'streetwear', subcategory: 'Graphic Tees', price: 1399, rating: 4.6, colors: ['Black', 'Ash'], sizes: ['M', 'L', 'XL'], description: 'Distressed type treatment printed on thick cotton with premium fall.', primaryImage: curatedImages.brokenTextTee }),
  makeProduct({ id: 'p13', name: 'Stay Hungry Tee', collection: 'streetwear', subcategory: 'Oversized T-shirts', price: 1499, rating: 4.7, colors: ['Black', 'Olive'], sizes: ['M', 'L', 'XL', 'XXL'], description: 'Statement oversized tee built for everyday street rotation and layered styling.', primaryImage: curatedImages.stayHungryTee }),
  makeProduct({ id: 'p14', name: 'Vintage Wash Tee', collection: 'streetwear', subcategory: 'Vintage Washed Designs', price: 1799, rating: 4.9, colors: ['Washed Black', 'Ash Grey'], sizes: ['M', 'L', 'XL', 'XXL'], description: 'Acid-washed oversized tee with broken-in texture and luxury streetwear finishing.', primaryImage: curatedImages.vintageWashTee }),
  makeProduct({ id: 'p15', name: 'Cosmic Drift Tee', collection: 'streetwear', subcategory: 'Cyberpunk Graphics', price: 1699, rating: 4.8, colors: ['Black', 'Night Blue'], sizes: ['M', 'L', 'XL'], description: 'Cosmic-inspired artwork with premium puff and screen print layering.', primaryImage: curatedImages.cosmicDriftTee }),
  makeProduct({ id: 'p16', name: 'Barcode Human Tee', collection: 'streetwear', subcategory: 'Graphic Tees', price: 1599, rating: 4.7, colors: ['Black', 'White'], sizes: ['M', 'L', 'XL', 'XXL'], description: 'Concept graphic tee fusing identity codes with monochrome street attitude.', primaryImage: curatedImages.barcodeHumanTee }),
  makeProduct({ id: 'p17', name: 'Graffiti Street Tee', collection: 'streetwear', subcategory: 'Graffiti Style Graphics', price: 1699, rating: 4.8, colors: ['Black', 'Concrete'], sizes: ['M', 'L', 'XL', 'XXL'], description: 'Graffiti-styled tee with premium oversized fit and elevated ink texture.', primaryImage: curatedImages.graffitiStreetTee }),
  makeProduct({ id: 'p18', name: 'Flame Street Tee', collection: 'streetwear', subcategory: 'Graphic Tees', price: 1599, rating: 4.7, colors: ['Black', 'Rust'], sizes: ['M', 'L', 'XL'], description: 'Aggressive flame motif laid over thick jersey for street-led styling.', primaryImage: curatedImages.flameStreetTee }),
  makeProduct({ id: 'p19', name: 'NeoStreet Hoodie', collection: 'streetwear', subcategory: 'Hoodies', price: 2499, rating: 4.9, colors: ['Black', 'Gunmetal'], sizes: ['M', 'L', 'XL', 'XXL'], featured: true, description: 'Heavy fleece hoodie with clean chest branding and structured oversized body.', primaryImage: curatedImages.neoStreetHoodie }),
  makeProduct({ id: 'p20', name: 'Cyber District Hoodie', collection: 'streetwear', subcategory: 'Hoodies', price: 2699, rating: 4.8, colors: ['Black', 'Cyan'], sizes: ['M', 'L', 'XL', 'XXL'], description: 'Cyber district graphics with heavyweight hood and premium brushed interior.', primaryImage: curatedImages.cyberDistrictHoodie }),
  makeProduct({ id: 'p21', name: 'Angel Wing Hoodie', collection: 'streetwear', subcategory: 'Hoodies', price: 2799, rating: 4.9, colors: ['Black', 'Off White'], sizes: ['M', 'L', 'XL'], description: 'Back graphic hoodie with premium wing artwork and luxe fleece weight.', primaryImage: curatedImages.angelWingHoodie }),
  makeProduct({ id: 'p22', name: 'Urban Shadow Hoodie', collection: 'streetwear', subcategory: 'Hoodies', price: 2299, rating: 4.6, colors: ['Black', 'Shadow'], sizes: ['M', 'L', 'XL'], description: 'Low-key shadow hoodie built for monochrome outfits and soft layering.', primaryImage: curatedImages.urbanShadowHoodie }),
  makeProduct({ id: 'p23', name: 'Elite Minimal Hoodie', collection: 'streetwear', subcategory: 'Hoodies', price: 2599, rating: 4.8, colors: ['Black', 'Taupe'], sizes: ['M', 'L', 'XL', 'XXL'], description: 'Minimal premium hoodie with elevated fit and subtle contrast detailing.', primaryImage: curatedImages.eliteMinimalHoodie }),
  makeProduct({ id: 'p24', name: 'Street Flame Hoodie', collection: 'streetwear', subcategory: 'Hoodies', price: 2699, rating: 4.8, colors: ['Black', 'Red'], sizes: ['M', 'L', 'XL'], description: 'Street-led flame hoodie with bold back graphic and premium rib construction.', primaryImage: curatedImages.streetFlameHoodie }),
  makeProduct({ id: 'p25', name: 'Cosmic Hoodie', collection: 'streetwear', subcategory: 'Hoodies', price: 2799, rating: 4.9, colors: ['Black', 'Midnight'], sizes: ['M', 'L', 'XL'], description: 'Cosmic visual system hoodie designed for luxury-heavy streetwear layering.', primaryImage: curatedImages.cosmicHoodie }),
  makeProduct({ id: 'p26', name: 'Speed Division Hoodie', collection: 'streetwear', subcategory: 'Hoodies', price: 2599, rating: 4.7, colors: ['Black', 'Silver'], sizes: ['M', 'L', 'XL'], description: 'High-speed motorsport influence translated into premium oversized fleece.', primaryImage: curatedImages.speedDivisionHoodie }),
  makeProduct({ id: 'p27', name: 'Vintage Wash Hoodie', collection: 'streetwear', subcategory: 'Vintage Washed Designs', price: 2899, rating: 4.9, colors: ['Washed Black', 'Faded Grey'], sizes: ['M', 'L', 'XL', 'XXL'], description: 'Vintage-treated heavyweight hoodie with broken texture and premium silhouette.', primaryImage: curatedImages.vintageWashHoodie }),
  makeProduct({ id: 'p28', name: 'Custom Name Hoodie', collection: 'streetwear', subcategory: 'Hoodies', price: 3199, rating: 4.9, colors: ['Black', 'Cream', 'Charcoal'], sizes: ['M', 'L', 'XL', 'XXL'], description: 'Personalized name hoodie crafted as a custom streetwear piece for one-off orders.', primaryImage: curatedImages.customNameHoodie }),
  makeProduct({ id: 'p35', name: 'Urban Snapback Cap', collection: 'streetwear', subcategory: 'Caps', price: 1299, rating: 4.7, colors: ['Black', 'Navy', 'Red'], sizes: ['One Size'], description: 'Premium snapback cap with embroidered logo and adjustable fit for street style.', primaryImage: curatedImages.urbanSnapbackCap }),
  makeProduct({ id: 'p36', name: 'Neon Glow Cap', collection: 'streetwear', subcategory: 'Caps', price: 1399, rating: 4.8, colors: ['Black', 'White'], sizes: ['One Size'], description: 'Glow-in-the-dark cap with cyberpunk design for night-time streetwear.', primaryImage: curatedImages.neonGlowCap }),
  makeProduct({ id: 'p37', name: 'Minimal Beanie', collection: 'streetwear', subcategory: 'Caps', price: 999, rating: 4.6, colors: ['Black', 'Grey', 'White'], sizes: ['One Size'], description: 'Soft knit beanie for minimalist layering and cold weather styling.', primaryImage: curatedImages.minimalBeanie }),
  makeProduct({ id: 'p29', name: 'Sovereign Chain', collection: 'jewelry', subcategory: 'Chains', price: 6999, rating: 4.9, colors: ['Gold', 'Silver'], sizes: ['18"', '20"', '22"'], featured: true, description: 'Bold statement chain with luxury weight and high-polish finish for daily layering.', primaryImage: curatedImages.sovereignChain }),
  makeProduct({ id: 'p30', name: 'Crest Signet Ring', collection: 'jewelry', subcategory: 'Rings', price: 3999, rating: 4.8, colors: ['Gold', 'Silver'], sizes: ['6', '7', '8', '9', '10'], description: 'Signet ring with crisp face geometry and refined edge finishing.', primaryImage: curatedImages.crestRing }),
  makeProduct({ id: 'p31', name: 'Orbit Bracelet', collection: 'jewelry', subcategory: 'Bracelets', price: 3499, rating: 4.7, colors: ['Gold', 'Silver'], sizes: ['S', 'M', 'L'], description: 'Minimal bracelet for stacked styling across modern and occasion looks.', primaryImage: curatedImages.orbitBracelet }),
  makeProduct({ id: 'p32', name: 'Noor Pendant', collection: 'jewelry', subcategory: 'Pendants', price: 3299, rating: 4.7, colors: ['Gold', 'Rose Gold'], sizes: ['One Size'], description: 'Pendant with refined geometry for understated premium jewelry dressing.', primaryImage: curatedImages.noorPendant }),
  makeProduct({ id: 'p33', name: 'Kundan Bridal Set', collection: 'jewelry', subcategory: 'Traditional Jewelry', price: 9999, rating: 5.0, colors: ['Gold'], sizes: ['One Size'], description: 'Traditional bridal set tuned for wedding styling and ceremonial shine.', primaryImage: curatedImages.kundanSet }),
  makeProduct({ id: 'p34', name: 'Linear Minimal Earrings', collection: 'jewelry', subcategory: 'Modern Minimal Jewelry', price: 2799, rating: 4.6, colors: ['Gold', 'Silver'], sizes: ['One Size'], description: 'Modern earrings with linear form language for tailored contemporary looks.', primaryImage: curatedImages.linearEarrings }),
];

module.exports = {
  createProductImages,
  seedProducts,
};
