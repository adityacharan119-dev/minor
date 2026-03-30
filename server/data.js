const encodeSvg = (value) => `data:image/svg+xml;utf8,${encodeURIComponent(value)}`;

const collectionThemes = {
  streetwear: {
    bg: '#050816',
    panel: '#0d1425',
    accent: '#22d3ee',
    text: '#f8fafc',
  },
  modern: {
    bg: '#141414',
    panel: '#222222',
    accent: '#f97316',
    text: '#fafaf9',
  },
  'home-living': {
    bg: '#0f172a',
    panel: '#1f2937',
    accent: '#f59e0b',
    text: '#fff7ed',
  },
};

const snapshotLabels = ['Front View', 'Studio Crop', 'Detail Focus', 'Lifestyle Angle', 'Close Finish'];

const colorTokens = {
  'Jet Black': '#10131a',
  'Soft White': '#f8fafc',
  Mocha: '#8b6a52',
  Olive: '#5b6749',
  Stone: '#d6d3d1',
  Slate: '#475569',
  Charcoal: '#1f2937',
  Cream: '#f5f5dc',
  Sand: '#d6c7b3',
  Cocoa: '#6c4b3b',
  Ash: '#d1d5db',
  Navy: '#243b5b',
  Rust: '#b45309',
  'Pastel Blue': '#93c5fd',
  Blush: '#fbcfe8',
  Ivory: '#f6f1e9',
  Walnut: '#5b4636',
  Oak: '#8b6b4a',
  White: '#ffffff',
  Black: '#0f172a',
};

const previewDefaults = {
  tee: {
    imageFrame: { x: 50, y: 46, width: 31, height: 31, radius: 18 },
    textPosition: { x: 50, y: 72 },
    textSize: 36,
  },
  hoodie: {
    imageFrame: { x: 50, y: 46, width: 34, height: 34, radius: 18 },
    textPosition: { x: 50, y: 72 },
    textSize: 36,
  },
  pillow: {
    imageFrame: { x: 50, y: 49, width: 50, height: 50, radius: 24 },
    textPosition: { x: 50, y: 79 },
    textSize: 32,
  },
  blanket: {
    imageFrame: { x: 50, y: 46, width: 60, height: 41, radius: 16 },
    textPosition: { x: 50, y: 75 },
    textSize: 30,
  },
  mug: {
    imageFrame: { x: 42, y: 49, width: 34, height: 39, radius: 12 },
    textPosition: { x: 42, y: 76 },
    textSize: 28,
  },
  frame: {
    imageFrame: { x: 50, y: 48, width: 54, height: 58, radius: 10 },
    textPosition: { x: 50, y: 84 },
    textSize: 28,
  },
};

const defaultTextPalette = ['#ffffff', '#111827', '#22d3ee', '#f97316', '#f59e0b', '#ec4899'];
const defaultFramePalette = ['#ffffff', '#111827', '#22d3ee', '#f59e0b', '#fb7185'];

const buildSlug = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const resolveColor = (value, fallback) => colorTokens[value] || fallback;

const makeOptionGroup = (key, label, values) => ({
  key,
  label,
  values,
});

const buildCustomizationConfig = ({ productType, optionGroups, notes = [] }) => ({
  livePreview: true,
  productType,
  allowText: true,
  allowImage: true,
  optionGroups,
  textPalette: defaultTextPalette,
  framePalette: defaultFramePalette,
  artworkEffects: ['original', 'mono', 'warm', 'cool', 'pop'],
  previewDefaults: previewDefaults[productType] || previewDefaults.tee,
  notes,
});

const drawTee = ({ garmentColor, accent }) => `
  <path d="M292 326 C346 278 554 278 608 326 L676 454 L587 515 L561 804 C493 834 407 834 339 804 L313 515 L224 454 Z" fill="${garmentColor}" stroke="rgba(255,255,255,0.16)" stroke-width="7"/>
  <path d="M392 327 C415 304 485 304 508 327" stroke="rgba(255,255,255,0.15)" stroke-width="8" stroke-linecap="round"/>
  <rect x="323" y="365" width="254" height="294" rx="36" fill="rgba(255,255,255,0.06)" stroke="${accent}" stroke-opacity="0.35" stroke-width="5" stroke-dasharray="16 12"/>
`;

const drawHoodie = ({ garmentColor, accent }) => `
  <path d="M363 187 C386 148 514 148 537 187 L584 283 C554 321 509 340 450 340 C391 340 346 321 316 283 Z" fill="${garmentColor}" stroke="rgba(255,255,255,0.16)" stroke-width="7"/>
  <path d="M255 346 C325 296 575 296 645 346 L688 812 C626 865 274 865 212 812 Z" fill="${garmentColor}" stroke="rgba(255,255,255,0.16)" stroke-width="7"/>
  <rect x="330" y="384" width="240" height="296" rx="34" fill="rgba(255,255,255,0.05)" stroke="${accent}" stroke-opacity="0.34" stroke-width="5" stroke-dasharray="16 12"/>
  <rect x="374" y="550" width="152" height="118" rx="24" fill="rgba(0,0,0,0.24)"/>
  <path d="M450 240 L420 300 L480 300 Z" fill="rgba(0,0,0,0.26)"/>
`;

const drawPillow = ({ garmentColor, accent }) => `
  <rect x="218" y="246" width="464" height="464" rx="96" fill="${garmentColor}" stroke="rgba(255,255,255,0.18)" stroke-width="10"/>
  <rect x="272" y="300" width="356" height="356" rx="68" fill="rgba(255,255,255,0.1)" stroke="${accent}" stroke-opacity="0.35" stroke-width="6" stroke-dasharray="16 14"/>
  <path d="M255 384 C290 324 610 324 645 384" stroke="rgba(255,255,255,0.15)" stroke-width="8" stroke-linecap="round"/>
`;

const drawBlanket = ({ garmentColor, accent }) => `
  <path d="M184 282 C233 230 668 230 716 282 L650 782 C604 826 296 826 250 782 Z" fill="${garmentColor}" stroke="rgba(255,255,255,0.18)" stroke-width="10"/>
  <rect x="243" y="324" width="414" height="286" rx="40" fill="rgba(255,255,255,0.08)" stroke="${accent}" stroke-opacity="0.35" stroke-width="6" stroke-dasharray="16 14"/>
  <path d="M243 676 C312 724 588 724 657 676" stroke="rgba(255,255,255,0.16)" stroke-width="10" stroke-linecap="round"/>
`;

const drawMug = ({ garmentColor, accent }) => `
  <rect x="258" y="285" width="318" height="404" rx="34" fill="${garmentColor}" stroke="rgba(255,255,255,0.18)" stroke-width="10"/>
  <path d="M577 366 C652 366 684 406 684 487 C684 568 652 608 577 608" fill="none" stroke="${garmentColor}" stroke-width="32" stroke-linecap="round"/>
  <rect x="308" y="336" width="216" height="284" rx="22" fill="rgba(255,255,255,0.08)" stroke="${accent}" stroke-opacity="0.35" stroke-width="6" stroke-dasharray="16 12"/>
`;

const drawFrame = ({ garmentColor, accent }) => `
  <rect x="238" y="174" width="424" height="618" rx="24" fill="${garmentColor}" stroke="rgba(255,255,255,0.18)" stroke-width="14"/>
  <rect x="282" y="220" width="336" height="526" rx="12" fill="#f8fafc" opacity="0.95"/>
  <rect x="320" y="258" width="260" height="450" rx="10" fill="rgba(15,23,42,0.08)" stroke="${accent}" stroke-opacity="0.38" stroke-width="6" stroke-dasharray="16 12"/>
`;

const drawBaseProduct = ({ productType, garmentColor, accent }) => {
  switch (productType) {
    case 'hoodie':
      return drawHoodie({ garmentColor, accent });
    case 'pillow':
      return drawPillow({ garmentColor, accent });
    case 'blanket':
      return drawBlanket({ garmentColor, accent });
    case 'mug':
      return drawMug({ garmentColor, accent });
    case 'frame':
      return drawFrame({ garmentColor, accent });
    case 'tee':
    default:
      return drawTee({ garmentColor, accent });
  }
};

const createProductImage = (product, variant = 0) => {
  const theme = collectionThemes[product.collection] || collectionThemes.streetwear;
  const angleShift = variant * 16;
  const garmentColor = resolveColor(product.colors[variant % product.colors.length], '#1f2937');
  const snapshot = snapshotLabels[variant] || snapshotLabels[0];
  const baseProduct = drawBaseProduct({
    productType: product.productType,
    garmentColor,
    accent: theme.accent,
  });

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1100">
      <defs>
        <linearGradient id="bg${variant}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${theme.bg}"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
        <radialGradient id="glow${variant}" cx="${72 - angleShift / 3}%" cy="${20 + angleShift / 4}%" r="46%">
          <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="900" height="1100" fill="url(#bg${variant})"/>
      <rect x="${90 + variant * 4}" y="${80 + variant * 6}" width="720" height="940" rx="48" fill="${theme.panel}" fill-opacity="0.68" stroke="rgba(255,255,255,0.08)" stroke-width="4"/>
      <circle cx="${694 - angleShift}" cy="${182 + angleShift / 2}" r="${150 + variant * 10}" fill="url(#glow${variant})"/>
      <text x="104" y="128" fill="rgba(255,255,255,0.55)" font-size="24" font-family="Arial" letter-spacing="7">${product.subcategory.toUpperCase()}</text>
      <text x="104" y="164" fill="${theme.accent}" font-size="20" font-family="Arial" letter-spacing="4">${snapshot.toUpperCase()}</text>
      ${baseProduct}
      <text x="104" y="930" fill="${theme.text}" font-size="54" font-family="Georgia" font-weight="700">${product.name}</text>
      <text x="104" y="980" fill="rgba(255,255,255,0.42)" font-size="22" font-family="Arial" letter-spacing="4">LIVE CUSTOM PREVIEW READY</text>
    </svg>
  `);
};

const createProductImages = (product) =>
  Array.from({ length: 5 }, (_, index) => createProductImage(product, index));

const makeProduct = ({
  id,
  name,
  collection,
  subcategory,
  productType,
  price,
  rating = 4.8,
  optionGroups,
  description,
  featured = false,
  notes = [],
}) => {
  const slug = buildSlug(name);
  const sizeGroup = optionGroups.find((group) => group.key === 'size');
  const colorGroup = optionGroups.find((group) => group.key === 'color');

  const base = {
    id,
    slug,
    name,
    collection,
    subcategory,
    productType,
    price,
    rating,
    colors: colorGroup?.values || ['Standard'],
    sizes: sizeGroup?.values || ['One Size'],
    description,
    featured,
    isCustomizable: true,
    primaryImage: '',
    customizationConfig: buildCustomizationConfig({
      productType,
      optionGroups,
      notes,
    }),
  };

  return {
    ...base,
    images: createProductImages(base),
  };
};

const seedProducts = [
  makeProduct({
    id: 'p1',
    name: 'Core Custom Tee',
    collection: 'streetwear',
    subcategory: 'Custom T-shirts',
    productType: 'tee',
    price: 849,
    featured: true,
    optionGroups: [
      makeOptionGroup('size', 'Size', ['S', 'M', 'L', 'XL', 'XXL']),
      makeOptionGroup('color', 'Garment Color', ['Jet Black', 'Soft White', 'Mocha', 'Olive']),
    ],
    description:
      'Heavy cotton tee built for names, logos, quotes, and photo prints with a live drag-and-drop preview.',
    notes: [
      'Upload a picture, crop it, and size it directly on the tee.',
      'Choose garment colour before adding the customized product to cart.',
    ],
  }),
  makeProduct({
    id: 'p2',
    name: 'Oversized Backprint Tee',
    collection: 'streetwear',
    subcategory: 'Custom T-shirts',
    productType: 'tee',
    price: 999,
    featured: true,
    optionGroups: [
      makeOptionGroup('size', 'Size', ['M', 'L', 'XL', 'XXL']),
      makeOptionGroup('color', 'Garment Color', ['Jet Black', 'Stone', 'Rust']),
    ],
    description:
      'Relaxed oversized fit with a larger printable panel for photo collages, creator drops, and statement text.',
    notes: [
      'Best suited for larger image prints and bold typography.',
      'Real-time preview updates as soon as the artwork changes.',
    ],
  }),
  makeProduct({
    id: 'p3',
    name: 'Neon Script Tee',
    collection: 'streetwear',
    subcategory: 'Graphic T-shirts',
    productType: 'tee',
    price: 949,
    optionGroups: [
      makeOptionGroup('size', 'Size', ['S', 'M', 'L', 'XL']),
      makeOptionGroup('color', 'Garment Color', ['Jet Black', 'Navy', 'Soft White']),
    ],
    description:
      'A sharp street tee for layered text, glowing artwork tones, and colour-rich edits inside the live studio.',
    notes: [
      'Try vivid artwork filters for poster-style colour output.',
      'Text palette includes bright neon and warm accent colours.',
    ],
  }),
  makeProduct({
    id: 'p4',
    name: 'Mono Studio Tee',
    collection: 'modern',
    subcategory: 'Minimal T-shirts',
    productType: 'tee',
    price: 899,
    optionGroups: [
      makeOptionGroup('size', 'Size', ['S', 'M', 'L', 'XL']),
      makeOptionGroup('color', 'Garment Color', ['Soft White', 'Ash', 'Charcoal']),
    ],
    description:
      'Clean everyday tee designed for subtle initials, monochrome artwork, and premium minimalist styling.',
    notes: [
      'Great for single-photo prints and small text details.',
      'Use mono or cool artwork tone for a sleek studio look.',
    ],
  }),
  makeProduct({
    id: 'p5',
    name: 'Signature Line Tee',
    collection: 'modern',
    subcategory: 'Minimal T-shirts',
    productType: 'tee',
    price: 799,
    optionGroups: [
      makeOptionGroup('size', 'Size', ['S', 'M', 'L', 'XL', 'XXL']),
      makeOptionGroup('color', 'Garment Color', ['Soft White', 'Sand', 'Black']),
    ],
    description:
      'Lightweight custom tee for names, messages, and photo placement with a calm modern look.',
    notes: [
      'Ideal for couple names, birthdays, and simple printed layouts.',
      'Real-time preview keeps text and image placement in sync.',
    ],
  }),
  makeProduct({
    id: 'p6',
    name: 'Campus Drop Hoodie',
    collection: 'streetwear',
    subcategory: 'Custom Hoodies',
    productType: 'hoodie',
    price: 1699,
    featured: true,
    optionGroups: [
      makeOptionGroup('size', 'Size', ['M', 'L', 'XL', 'XXL']),
      makeOptionGroup('color', 'Hoodie Color', ['Jet Black', 'Slate', 'Olive']),
    ],
    description:
      'Premium fleece hoodie tuned for college names, team graphics, and heavier photo-led custom artwork.',
    notes: [
      'Large print window works well for portraits and event artwork.',
      'You can drag the artwork and resize it live before checkout.',
    ],
  }),
  makeProduct({
    id: 'p7',
    name: 'Street Zip Hoodie',
    collection: 'streetwear',
    subcategory: 'Custom Hoodies',
    productType: 'hoodie',
    price: 1899,
    featured: true,
    optionGroups: [
      makeOptionGroup('size', 'Size', ['M', 'L', 'XL', 'XXL']),
      makeOptionGroup('color', 'Hoodie Color', ['Jet Black', 'Charcoal', 'Cream']),
    ],
    description:
      'Zip hoodie with a balanced front panel for clean logos, photo badges, and creator branding edits.',
    notes: [
      'Try warm or cool artwork tones for a different print mood.',
      'Frame colour controls help separate the uploaded image from the garment.',
    ],
  }),
  makeProduct({
    id: 'p8',
    name: 'Shadow Panel Hoodie',
    collection: 'streetwear',
    subcategory: 'Custom Hoodies',
    productType: 'hoodie',
    price: 1799,
    optionGroups: [
      makeOptionGroup('size', 'Size', ['M', 'L', 'XL']),
      makeOptionGroup('color', 'Hoodie Color', ['Jet Black', 'Navy', 'Cocoa']),
    ],
    description:
      'A darker custom hoodie made for bold text, cropped photo patches, and layered print placements.',
    notes: [
      'Use the crop controls to zoom into faces or artwork details.',
      'Best for back-to-school drops and compact front graphics.',
    ],
  }),
  makeProduct({
    id: 'p9',
    name: 'Minimal Pullover Hoodie',
    collection: 'modern',
    subcategory: 'Everyday Hoodies',
    productType: 'hoodie',
    price: 1699,
    optionGroups: [
      makeOptionGroup('size', 'Size', ['S', 'M', 'L', 'XL']),
      makeOptionGroup('color', 'Hoodie Color', ['Ash', 'Charcoal', 'Soft White']),
    ],
    description:
      'Soft pullover hoodie for smaller logo prints, clean typography, and subtle photo-led customization.',
    notes: [
      'Perfect for corporate gifting, school batches, and simple personal branding.',
      'Preview updates instantly when you change text colours or crop values.',
    ],
  }),
  makeProduct({
    id: 'p10',
    name: 'Weekend Utility Hoodie',
    collection: 'modern',
    subcategory: 'Everyday Hoodies',
    productType: 'hoodie',
    price: 1899,
    optionGroups: [
      makeOptionGroup('size', 'Size', ['S', 'M', 'L', 'XL']),
      makeOptionGroup('color', 'Hoodie Color', ['Sand', 'Slate', 'Black']),
    ],
    description:
      'Structured hoodie for smart everyday gifting, personalized slogans, and framed portrait prints.',
    notes: [
      'Try the artwork border colour options for a poster-card effect.',
      'The live editor lets customers fine-tune size before adding to cart.',
    ],
  }),
  makeProduct({
    id: 'p11',
    name: 'Memory Print Pillow',
    collection: 'home-living',
    subcategory: 'Photo Pillows',
    productType: 'pillow',
    price: 899,
    featured: true,
    optionGroups: [
      makeOptionGroup('size', 'Pillow Size', ['12 x 12', '16 x 16', '18 x 18']),
      makeOptionGroup('color', 'Cover Tone', ['Ivory', 'Blush', 'Slate']),
    ],
    description:
      'Soft customizable pillow that lets customers upload a photo, resize it, crop it, and choose the pillow size.',
    notes: [
      'Customers can add their own picture directly on the pillow.',
      'Pillow size can be changed before adding the customized order to cart.',
    ],
  }),
  makeProduct({
    id: 'p12',
    name: 'Cloud Comfort Blanket',
    collection: 'home-living',
    subcategory: 'Photo Blankets',
    productType: 'blanket',
    price: 1999,
    featured: true,
    optionGroups: [
      makeOptionGroup('size', 'Blanket Size', ['Single', 'Double', 'Queen']),
      makeOptionGroup('fibre', 'Fibre', ['Microfiber', 'Sherpa', 'Polar Fleece']),
      makeOptionGroup('color', 'Blanket Tone', ['Ivory', 'Slate', 'Blush']),
    ],
    description:
      'A personalized blanket with custom photo upload, live crop controls, selectable fibre, and size options.',
    notes: [
      'Customers can choose their own fibre before checkout.',
      'Photo placement and crop can be adjusted live for the blanket print area.',
    ],
  }),
  makeProduct({
    id: 'p13',
    name: 'Warm Moments Mug',
    collection: 'home-living',
    subcategory: 'Photo Mugs',
    productType: 'mug',
    price: 449,
    optionGroups: [
      makeOptionGroup('size', 'Mug Size', ['11 oz', '15 oz']),
      makeOptionGroup('color', 'Accent Color', ['White', 'Black', 'Pastel Blue']),
    ],
    description:
      'Ceramic mug ready for portraits, logos, and small message prints with simple live placement controls.',
    notes: [
      'Crop tools help center faces and logos inside the mug wrap.',
      'Text and border colours can be adjusted during customization.',
    ],
  }),
  makeProduct({
    id: 'p14',
    name: 'Gallery Photo Frame',
    collection: 'home-living',
    subcategory: 'Photo Frames',
    productType: 'frame',
    price: 1199,
    optionGroups: [
      makeOptionGroup('size', 'Frame Size', ['A5', 'A4', '12 x 18']),
      makeOptionGroup('color', 'Frame Tone', ['Oak', 'Walnut', 'Black']),
    ],
    description:
      'Table and wall-ready photo frame with a custom image upload flow, live crop control, and frame colour selection.',
    notes: [
      'Best for portraits, anniversary photos, and gift-ready prints.',
      'Customers can resize the picture and crop it before purchase.',
    ],
  }),
];

module.exports = {
  createProductImages,
  seedProducts,
};
