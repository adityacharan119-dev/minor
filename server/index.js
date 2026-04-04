const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const { createProductImages, seedProducts } = require('./data');

let putBlob = null;
try {
  ({ put: putBlob } = require('@vercel/blob'));
} catch {
  putBlob = null;
}

dotenv.config();

const app = express();
app.set('trust proxy', true);

const PORT = process.env.PORT || 5000;
const uploadDirectory = path.join(os.tmpdir(), 'mycraft-uploads');
const catalogAssetDirectory = path.join(__dirname, 'public', 'catalog-assets');
const clientBuildDirectory = path.join(__dirname, '..', 'client', 'dist');
const clientIndexFile = path.join(clientBuildDirectory, 'index.html');
const hasClientBuild = fs.existsSync(clientIndexFile);
const databaseConfigured = Boolean(process.env.MONGODB_URI);
const uploadSizeLimit = Number(process.env.MAX_UPLOAD_SIZE_BYTES || 4 * 1024 * 1024);
const mongoServerSelectionTimeout = Number(
  process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 1500,
);
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';
const otpEmailConfigured =
  Boolean(process.env.SMTP_HOST) &&
  Boolean(process.env.SMTP_USER) &&
  Boolean(process.env.SMTP_PASS) &&
  Boolean(process.env.SMTP_FROM_EMAIL);
const allowedOrigins = String(process.env.CORS_ORIGIN || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

fs.mkdirSync(uploadDirectory, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: uploadSizeLimit,
  },
});

const razorpayEnabled =
  Boolean(process.env.RAZORPAY_KEY_ID) &&
  Boolean(process.env.RAZORPAY_KEY_SECRET) &&
  !String(process.env.RAZORPAY_KEY_ID).includes('placeholder');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

const mailTransport = otpEmailConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const schemaOptions = {
  suppressReservedKeysWarning: true,
  versionKey: false,
};

const positionSchema = new mongoose.Schema(
  {
    x: Number,
    y: Number,
  },
  { _id: false },
);

const frameSchema = new mongoose.Schema(
  {
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    radius: Number,
  },
  { _id: false },
);

const cropSchema = new mongoose.Schema(
  {
    x: Number,
    y: Number,
    zoom: Number,
  },
  { _id: false },
);

const customizationSchema = new mongoose.Schema(
  {
    text: String,
    textColor: String,
    textPosition: positionSchema,
    textSize: Number,
    imageSrc: String,
    imagePosition: positionSchema,
    imageScale: Number,
    imageFrame: frameSchema,
    imageCrop: cropSchema,
    artworkEffect: String,
    artworkBorderColor: String,
  },
  { _id: false },
);

const orderItemSchema = new mongoose.Schema(
  {
    id: String,
    slug: String,
    name: String,
    price: Number,
    image: String,
    size: String,
    color: String,
    selectedOptions: { type: mongoose.Schema.Types.Mixed, default: {} },
    quantity: Number,
    customization: customizationSchema,
  },
  { _id: false },
);

const customerSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    pincode: String,
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    collection: { type: String, required: true },
    subcategory: { type: String, required: true },
    productType: { type: String, default: 'tee' },
    price: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 },
    colors: { type: [String], default: ['Black'] },
    sizes: { type: [String], default: ['One Size'] },
    description: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    isCustomizable: { type: Boolean, default: true },
    primaryImage: { type: String, default: '' },
    images: { type: [String], default: [] },
    customizationConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  schemaOptions,
);

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  schemaOptions,
);

const pendingSignupSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    passwordHash: { type: String, required: true },
    otpChannel: { type: String, required: true },
    otpTarget: { type: String, required: true },
    verificationCode: { type: String, required: true },
    expiresAt: { type: Number, required: true },
  },
  schemaOptions,
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    trackingCode: { type: String, required: true, unique: true, index: true },
    customer: { type: customerSchema, default: {} },
    items: { type: [orderItemSchema], default: [] },
    shipping: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    status: { type: String, default: 'Processing' },
    paymentStatus: { type: String, default: 'Awaiting payment' },
    createdAt: { type: String, required: true },
  },
  schemaOptions,
);

const customRequestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    reference: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    productType: { type: String, default: '' },
    productName: { type: String, default: '' },
    size: { type: String, default: '' },
    color: { type: String, default: '' },
    fabric: { type: String, default: '' },
    fitNotes: { type: String, default: '' },
    neckline: { type: String, default: '' },
    sleeve: { type: String, default: '' },
    description: { type: String, default: '' },
    inspirationImage: { type: String, default: null },
    adminBudget: { type: Number, default: null },
    quoteNotes: { type: String, default: '' },
    quoteStatus: { type: String, default: 'Pending review' },
    quotedAt: { type: String, default: null },
    createdAt: { type: String, required: true },
  },
  schemaOptions,
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const PendingSignup =
  mongoose.models.PendingSignup || mongoose.model('PendingSignup', pendingSignupSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
const CustomRequest =
  mongoose.models.CustomRequest || mongoose.model('CustomRequest', customRequestSchema);

const db = {
  products: [...seedProducts],
  orders: [],
  requests: [],
  users: [],
  pendingSignups: [],
};
const curatedSeedIds = seedProducts.map((product) => product.id);

let databasePromise = null;
let seedPromise = null;

const makeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const formatDate = () => new Date().toISOString();
const makeTrackingCode = () => `MYC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const makeVerificationCode = () => String(Math.floor(100000 + Math.random() * 900000));
const normalizeEmail = (value = '') => String(value).trim().toLowerCase();
const normalizePhone = (value = '') => String(value).replace(/\D/g, '');
const trimTrailingSlash = (value = '') => String(value).replace(/\/+$/, '');
const normalizeOtpChannel = (value = '') => {
  const normalized = String(value).trim().toLowerCase();
  return normalized === 'phone' ? 'phone' : 'email';
};
const buildSlug = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'new-product';
const normalizeList = (value, fallback = []) =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : fallback;
const sanitizeSegment = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'file';
const fileExtensionByMime = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};
const defaultPreviewByType = {
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

const inferProductType = (subcategory = '', name = '') => {
  const value = `${subcategory} ${name}`.toLowerCase();
  if (value.includes('hoodie')) return 'hoodie';
  if (value.includes('pillow')) return 'pillow';
  if (value.includes('blanket')) return 'blanket';
  if (value.includes('mug')) return 'mug';
  if (value.includes('frame')) return 'frame';
  return 'tee';
};

const buildDefaultCustomizationConfig = ({ productType = 'tee', sizes = [], colors = [] }) => ({
  livePreview: true,
  productType,
  allowText: true,
  allowImage: true,
  optionGroups: [
    ...(sizes.length ? [{ key: 'size', label: 'Size', values: sizes }] : []),
    ...(colors.length ? [{ key: 'color', label: 'Color', values: colors }] : []),
  ],
  textPalette: ['#ffffff', '#111827', '#22d3ee', '#f97316', '#f59e0b', '#ec4899'],
  framePalette: ['#ffffff', '#111827', '#22d3ee', '#f59e0b', '#fb7185'],
  artworkEffects: ['original', 'mono', 'warm', 'cool', 'pop'],
  previewDefaults: defaultPreviewByType[productType] || defaultPreviewByType.tee,
  notes: [],
});

const hashPassword = (value = '') => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(value), salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (value = '', storedHash = '') => {
  const [salt, originalHash] = String(storedHash).split(':');

  if (!salt || !originalHash) {
    return false;
  }

  const computedHash = crypto.scryptSync(String(value), salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(computedHash, 'hex'));
};

const sendSignupOtpEmail = async ({ email, name, verificationCode, expiresAt }) => {
  if (!mailTransport) {
    throw new Error('Email OTP delivery is not configured on the server.');
  }

  const expiresAtText = new Date(expiresAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  await mailTransport.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: email,
    subject: 'MyCraft signup OTP',
    text: `Hello ${name}, your MyCraft signup OTP is ${verificationCode}. It expires on ${expiresAtText}.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #0b1120; color: #f8fafc; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);">
        <p style="font-size: 12px; letter-spacing: 0.32em; text-transform: uppercase; color: #22d3ee; margin: 0 0 18px;">MyCraft Signup</p>
        <h1 style="font-size: 28px; margin: 0 0 14px;">Verify your email</h1>
        <p style="font-size: 16px; line-height: 1.7; color: #cbd5e1; margin: 0 0 24px;">
          Hello ${name}, use the OTP below to complete your MyCraft account signup.
        </p>
        <div style="padding: 18px 22px; border-radius: 16px; background: #111827; border: 1px solid rgba(34,211,238,0.35); display: inline-block; font-size: 34px; font-weight: 700; letter-spacing: 0.36em; color: #f8fafc;">
          ${verificationCode}
        </div>
        <p style="font-size: 14px; line-height: 1.7; color: #94a3b8; margin: 24px 0 0;">
          This OTP expires on ${expiresAtText}. If you did not request this signup, you can ignore this email.
        </p>
      </div>
    `,
  });
};

const normalizeSelectedOptions = (value = {}) =>
  Object.fromEntries(
    Object.entries(value || {})
      .map(([key, optionValue]) => [String(key).trim(), String(optionValue).trim()])
      .filter(([key, optionValue]) => key && optionValue),
  );

const toPlainObject = (value) => (value?.toObject ? value.toObject() : value);

const serializeUser = (user) => {
  const plainUser = toPlainObject(user);
  if (!plainUser) {
    return null;
  }

  const { passwordHash, ...safeUser } = plainUser;
  return safeUser;
};

const toAbsoluteUrl = (req, value) => {
  if (!value) {
    return value;
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }

  const configuredBaseUrl = trimTrailingSlash(process.env.PUBLIC_BASE_URL);
  if (configuredBaseUrl) {
    return `${configuredBaseUrl}${value.startsWith('/') ? value : `/${value}`}`;
  }

  if (!req) {
    return value;
  }

  const requestOrigin = `${req.protocol}://${req.get('host')}`;
  return `${trimTrailingSlash(requestOrigin)}${value.startsWith('/') ? value : `/${value}`}`;
};

const serializeProduct = (req, product) => {
  const plainProduct = toPlainObject(product);
  return {
    ...plainProduct,
    images: Array.isArray(plainProduct.images)
      ? plainProduct.images.map((image) => toAbsoluteUrl(req, image))
      : [],
    primaryImage: toAbsoluteUrl(req, plainProduct.primaryImage),
  };
};

const serializeRequest = (req, request) => {
  const plainRequest = toPlainObject(request);
  return {
    ...plainRequest,
    inspirationImage: toAbsoluteUrl(req, plainRequest.inspirationImage),
  };
};

const serializeOrder = (req, order) => {
  const plainOrder = toPlainObject(order);
  return {
    ...plainOrder,
    items: Array.isArray(plainOrder.items)
      ? plainOrder.items.map((item) => ({
          ...item,
          image: toAbsoluteUrl(req, item.image),
          customization: item.customization
            ? {
                ...item.customization,
                imageSrc: toAbsoluteUrl(req, item.customization.imageSrc),
              }
            : item.customization,
        }))
      : [],
  };
};

const normalizeCustomization = (value = null) => {
  if (!value) {
    return null;
  }

  const fallbackImageX = Number(value.imagePosition?.x ?? value.imageFrame?.x ?? 50);
  const fallbackImageY = Number(value.imagePosition?.y ?? value.imageFrame?.y ?? 50);
  const fallbackScale = Number(value.imageScale ?? value.imageCrop?.zoom ?? 1);

  return {
    text: String(value.text || '').trim(),
    textColor: String(value.textColor || '#ffffff'),
    textPosition: {
      x: Number(value.textPosition?.x ?? 50),
      y: Number(value.textPosition?.y ?? 50),
    },
    textSize: Number(value.textSize ?? 32),
    imageSrc: String(value.imageSrc || ''),
    imagePosition: {
      x: fallbackImageX,
      y: fallbackImageY,
    },
    imageScale: fallbackScale,
    imageFrame: {
      x: fallbackImageX,
      y: fallbackImageY,
      width: Number(value.imageFrame?.width ?? 34),
      height: Number(value.imageFrame?.height ?? 34),
      radius: Number(value.imageFrame?.radius ?? 16),
    },
    imageCrop: {
      x: Number(value.imageCrop?.x ?? 0),
      y: Number(value.imageCrop?.y ?? 0),
      zoom: fallbackScale,
    },
    artworkEffect: String(value.artworkEffect || 'original'),
    artworkBorderColor: String(value.artworkBorderColor || '#ffffff'),
  };
};

const normalizeOrderItems = (items = []) =>
  items.map((item) => ({
    id: String(item.id || ''),
    slug: String(item.slug || ''),
    name: String(item.name || ''),
    price: Number(item.price || 0),
    image: String(item.image || ''),
    size: String(item.size || ''),
    color: String(item.color || ''),
    selectedOptions: normalizeSelectedOptions(item.selectedOptions),
    quantity: Math.max(1, Number(item.quantity || 1)),
    customization: normalizeCustomization(item.customization),
  }));

const normalizeCustomer = (customer = {}) => ({
  name: String(customer.name || '').trim(),
  email: normalizeEmail(customer.email),
  phone: normalizePhone(customer.phone),
  address: String(customer.address || '').trim(),
  city: String(customer.city || '').trim(),
  pincode: String(customer.pincode || '').trim(),
});

const normalizeProductRecord = (payload = {}, existing = null) => {
  const current = existing ? toPlainObject(existing) : null;
  const nextName = payload.name !== undefined ? String(payload.name).trim() : current?.name || '';
  const nextCollection =
    payload.collection !== undefined ? String(payload.collection).trim() : current?.collection || '';
  const nextSubcategory =
    payload.subcategory !== undefined
      ? String(payload.subcategory).trim()
      : current?.subcategory || '';
  const nextPrimaryImage =
    payload.primaryImage !== undefined
      ? String(payload.primaryImage).trim()
      : current?.primaryImage || '';
  const nextColors = normalizeList(payload.colors, current?.colors || ['Black']);
  const nextSizes = normalizeList(payload.sizes, current?.sizes || ['One Size']);
  const nextProductType =
    payload.productType !== undefined
      ? String(payload.productType).trim()
      : current?.productType || inferProductType(nextSubcategory, nextName);
  const nextCustomizationConfig =
    payload.customizationConfig !== undefined
      ? payload.customizationConfig
      : current?.customizationConfig ||
        buildDefaultCustomizationConfig({
          productType: nextProductType,
          sizes: nextSizes,
          colors: nextColors,
        });
  const nextRecord = {
    id: current?.id || makeId('prod'),
    slug:
      payload.slug !== undefined
        ? buildSlug(payload.slug)
        : current?.slug || buildSlug(nextName),
    name: nextName,
    collection: nextCollection,
    subcategory: nextSubcategory,
    productType: nextProductType,
    price: Number(payload.price ?? current?.price ?? 0),
    rating: Number(payload.rating ?? current?.rating ?? 4.8),
    colors: nextColors,
    sizes: nextSizes,
    description:
      payload.description !== undefined
        ? String(payload.description || '').trim()
        : current?.description || 'New product added from admin dashboard.',
    featured:
      payload.featured !== undefined ? Boolean(payload.featured) : Boolean(current?.featured),
    isCustomizable:
      payload.isCustomizable !== undefined
        ? Boolean(payload.isCustomizable)
        : current?.isCustomizable !== undefined
          ? Boolean(current.isCustomizable)
          : true,
    primaryImage: nextPrimaryImage,
    customizationConfig:
      nextCustomizationConfig && typeof nextCustomizationConfig === 'object'
        ? nextCustomizationConfig
        : buildDefaultCustomizationConfig({
            productType: nextProductType,
            sizes: nextSizes,
            colors: nextColors,
          }),
  };

  const shouldRefreshImages =
    !current ||
    nextRecord.name !== current.name ||
    nextRecord.collection !== current.collection ||
    nextRecord.subcategory !== current.subcategory ||
    nextRecord.productType !== current.productType ||
    nextRecord.primaryImage !== current.primaryImage ||
    JSON.stringify(nextRecord.colors) !== JSON.stringify(current.colors);

  nextRecord.images = shouldRefreshImages
    ? createProductImages(nextRecord)
    : current.images || createProductImages(nextRecord);

  return nextRecord;
};

const getUploadExtension = (file) =>
  path.extname(file?.originalname || '').toLowerCase() || fileExtensionByMime[file?.mimetype] || '';

const storeUploadedFile = async (file, folder) => {
  if (!file) {
    return null;
  }

  const baseName = sanitizeSegment(path.basename(file.originalname || 'upload', getUploadExtension(file)));
  const fileExtension = getUploadExtension(file);
  const pathname = `${sanitizeSegment(folder)}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${baseName}${fileExtension}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    if (!putBlob) {
      throw new Error('Vercel Blob SDK is not installed. Add @vercel/blob to the server project.');
    }

    const blob = await putBlob(pathname, file.buffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.mimetype || undefined,
    });

    return blob.url;
  }

  const localFilename = pathname.replace(/\//g, '-');
  fs.writeFileSync(path.join(uploadDirectory, localFilename), file.buffer);
  return `/uploads/${localFilename}`;
};

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const ensureSeedData = async () => {
  if (!databaseConfigured) {
    return false;
  }

  if (seedPromise) {
    await seedPromise;
    return true;
  }

  seedPromise = (async () => {
    await Product.bulkWrite(
      seedProducts.map((product) => ({
        updateOne: {
          filter: { id: product.id },
          update: { $set: product },
          upsert: true,
        },
      })),
    );

    await Product.deleteMany({
      $and: [
        { id: { $regex: /^p\d+$/ } },
        { id: { $nin: curatedSeedIds } },
      ],
    });
  })().catch((error) => {
    seedPromise = null;
    throw error;
  });

  await seedPromise;
  return true;
};

const ensureDatabase = async () => {
  if (!databaseConfigured) {
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    await ensureSeedData();
    return true;
  }

  if (!databasePromise) {
    databasePromise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: mongoServerSelectionTimeout,
      })
      .then(() => {
        console.log('MongoDB connection established');
        return true;
      })
      .catch((error) => {
        console.log(`MongoDB connection failed: ${error.message}`);
        databasePromise = null;
        return false;
      });
  }

  const connected = await databasePromise;
  if (!connected) {
    return false;
  }

  try {
    await ensureSeedData();
  } catch (error) {
    console.log(`Product seed failed: ${error.message}`);
  }

  return true;
};

const cleanupExpiredPendingSignups = async () => {
  if (await ensureDatabase()) {
    await PendingSignup.deleteMany({ expiresAt: { $lt: Date.now() } });
    return;
  }

  db.pendingSignups = db.pendingSignups.filter((entry) => entry.expiresAt >= Date.now());
};

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
  }),
);
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(uploadDirectory));
app.use('/catalog-assets', express.static(catalogAssetDirectory));
if (hasClientBuild) {
  app.use(express.static(clientBuildDirectory));
}

app.get(
  '/api/health',
  asyncHandler(async (_req, res) => {
    const database = await ensureDatabase();
    res.json({
      status: 'ok',
      database: database ? 'connected' : 'memory-fallback',
      blob: process.env.BLOB_READ_WRITE_TOKEN ? 'configured' : 'local-fallback',
    });
  }),
);

app.post(
  '/api/auth/signup/request',
  asyncHandler(async (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const phone = normalizePhone(req.body.phone);
    const password = String(req.body.password || '');
    const otpChannel = normalizeOtpChannel(req.body.otpChannel);
    const otpTarget = email;

    if (!name || !email || !phone || !password) {
      res.status(400).json({ message: 'Name, email, phone, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (!email) {
      res.status(400).json({ message: 'A valid email address is required for OTP delivery.' });
      return;
    }

    if (otpChannel === 'phone') {
      res.status(400).json({ message: 'Phone OTP is not configured yet. Please use email OTP.' });
      return;
    }

    if (!otpEmailConfigured) {
      res.status(503).json({
        message: 'Email OTP delivery is not configured on the server yet.',
      });
      return;
    }

    await cleanupExpiredPendingSignups();

    if (await ensureDatabase()) {
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] }).lean();
      if (existingUser) {
        res.status(409).json({ message: 'An account already exists with this email or mobile number.' });
        return;
      }

      await PendingSignup.deleteMany({ $or: [{ email }, { phone }] });

      const pendingSignupPayload = {
        id: makeId('pending'),
        name,
        email,
        phone,
        passwordHash: hashPassword(password),
        otpChannel: 'email',
        otpTarget,
        verificationCode: makeVerificationCode(),
        expiresAt: Date.now() + 10 * 60 * 1000,
      };

      const pendingSignup = await PendingSignup.create(pendingSignupPayload);

      try {
        await sendSignupOtpEmail(pendingSignupPayload);
      } catch (error) {
        await PendingSignup.deleteOne({ id: pendingSignup.id });
        res.status(502).json({
          message: 'Unable to send OTP email right now. Please try again later.',
          detail: process.env.NODE_ENV === 'production' ? undefined : error.message,
        });
        return;
      }

      res.status(201).json({
        pendingSignupId: pendingSignup.id,
        expiresAt: new Date(pendingSignup.expiresAt).toISOString(),
        otpChannel: 'email',
        otpTarget,
        message: 'An OTP has been sent to your email address.',
      });
      return;
    }

    const existingUser = db.users.find((user) => user.email === email || user.phone === phone);
    if (existingUser) {
      res.status(409).json({ message: 'An account already exists with this email or mobile number.' });
      return;
    }

    db.pendingSignups = db.pendingSignups.filter(
      (entry) => entry.email !== email && entry.phone !== phone,
    );

    const pendingSignup = {
      id: makeId('pending'),
      name,
      email,
      phone,
      passwordHash: hashPassword(password),
      otpChannel: 'email',
      otpTarget,
      verificationCode: makeVerificationCode(),
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    try {
      await sendSignupOtpEmail(pendingSignup);
    } catch (error) {
      res.status(502).json({
        message: 'Unable to send OTP email right now. Please try again later.',
        detail: process.env.NODE_ENV === 'production' ? undefined : error.message,
      });
      return;
    }

    db.pendingSignups.unshift(pendingSignup);

    res.status(201).json({
      pendingSignupId: pendingSignup.id,
      expiresAt: new Date(pendingSignup.expiresAt).toISOString(),
      otpChannel: 'email',
      otpTarget,
      message: 'An OTP has been sent to your email address.',
    });
  }),
);

app.post(
  '/api/auth/signup/verify',
  asyncHandler(async (req, res) => {
    const pendingSignupId = String(req.body.pendingSignupId || '').trim();
    const verificationCode = String(req.body.verificationCode || '').trim();

    if (await ensureDatabase()) {
      const pendingSignup = await PendingSignup.findOne({ id: pendingSignupId }).lean();

      if (!pendingSignup) {
        res.status(404).json({ message: 'Signup session not found. Please request a new verification code.' });
        return;
      }

      if (pendingSignup.expiresAt < Date.now()) {
        await PendingSignup.deleteOne({ id: pendingSignupId });
        res.status(410).json({ message: 'Verification code expired. Please request a new one.' });
        return;
      }

      if (pendingSignup.verificationCode !== verificationCode) {
        res.status(400).json({ message: 'Incorrect verification code.' });
        return;
      }

      const user = await User.create({
        id: makeId('cust'),
        name: pendingSignup.name,
        email: pendingSignup.email,
        phone: pendingSignup.phone,
        passwordHash: pendingSignup.passwordHash,
        createdAt: formatDate(),
      });

      await PendingSignup.deleteOne({ id: pendingSignupId });
      res.status(201).json({ user: serializeUser(user) });
      return;
    }

    const signupIndex = db.pendingSignups.findIndex((entry) => entry.id === pendingSignupId);

    if (signupIndex === -1) {
      res.status(404).json({ message: 'Signup session not found. Please request a new verification code.' });
      return;
    }

    const pendingSignup = db.pendingSignups[signupIndex];

    if (pendingSignup.expiresAt < Date.now()) {
      db.pendingSignups.splice(signupIndex, 1);
      res.status(410).json({ message: 'Verification code expired. Please request a new one.' });
      return;
    }

    if (pendingSignup.verificationCode !== verificationCode) {
      res.status(400).json({ message: 'Incorrect verification code.' });
      return;
    }

    const user = {
      id: makeId('cust'),
      name: pendingSignup.name,
      email: pendingSignup.email,
      phone: pendingSignup.phone,
      passwordHash: pendingSignup.passwordHash,
      createdAt: formatDate(),
    };

    db.pendingSignups.splice(signupIndex, 1);
    db.users.unshift(user);

    res.status(201).json({ user: serializeUser(user) });
  }),
);

app.post(
  '/api/auth/login',
  asyncHandler(async (req, res) => {
    const identifierRaw = String(req.body.identifier || req.body.email || req.body.phone || '').trim();
    const password = String(req.body.password || '');
    const isEmailLogin = identifierRaw.includes('@');
    const email = normalizeEmail(identifierRaw);
    const phone = normalizePhone(identifierRaw);

    if (!identifierRaw || !password) {
      res.status(400).json({ message: 'Email or phone number and password are required to log in.' });
      return;
    }

    if (await ensureDatabase()) {
      const user = await User.findOne(isEmailLogin ? { email } : { phone }).lean();

      if (!user) {
        res.status(404).json({ message: 'No customer account matches that login.' });
        return;
      }

      if (!verifyPassword(password, user.passwordHash)) {
        res.status(401).json({ message: 'Incorrect password.' });
        return;
      }

      res.json({ user: serializeUser(user) });
      return;
    }

    const user = db.users.find((entry) => (isEmailLogin ? entry.email === email : entry.phone === phone));

    if (!user) {
      res.status(404).json({ message: 'No customer account matches that login.' });
      return;
    }

    if (!verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ message: 'Incorrect password.' });
      return;
    }

    res.json({ user: serializeUser(user) });
  }),
);

app.get('/api/config/razorpay', (_req, res) => {
  res.json({
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    enabled: razorpayEnabled,
  });
});

app.get(
  '/api/collections/summary',
  asyncHandler(async (_req, res) => {
    const collections = ['streetwear', 'modern', 'home-living'];

    if (await ensureDatabase()) {
      const counts = await Promise.all(
        collections.map(async (collection) => ({
          collection,
          count: await Product.countDocuments({ collection }),
        })),
      );
      res.json({ collections: counts });
      return;
    }

    const summary = collections.map((collection) => ({
      collection,
      count: db.products.filter((product) => product.collection === collection).length,
    }));

    res.json({ collections: summary });
  }),
);

app.get(
  '/api/products',
  asyncHandler(async (req, res) => {
    const { collection, search = '', featured, limit } = req.query;
    let products = [];

    if (await ensureDatabase()) {
      const query = collection ? { collection } : {};
      products = await Product.find(query).lean();
    } else {
      products = [...db.products];
      if (collection) {
        products = products.filter((product) => product.collection === collection);
      }
    }

    if (featured === 'true') {
      products = products.filter((product) => product.featured);
    }

    if (search) {
      const searchLower = String(search).toLowerCase();
      products = products.filter((product) =>
        [product.name, product.collection, product.subcategory, product.description]
          .join(' ')
          .toLowerCase()
          .includes(searchLower),
      );
    }

    if (limit) {
      products = products.slice(0, Number(limit));
    }

    res.json({ products: products.map((product) => serializeProduct(req, product)) });
  }),
);

app.get(
  '/api/products/:slug',
  asyncHandler(async (req, res) => {
    let product = null;

    if (await ensureDatabase()) {
      product = await Product.findOne({ slug: req.params.slug }).lean();
    } else {
      product = db.products.find((item) => item.slug === req.params.slug);
    }

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ product: serializeProduct(req, product) });
  }),
);

app.post(
  '/api/products',
  asyncHandler(async (req, res) => {
    const product = normalizeProductRecord(req.body);

    if (await ensureDatabase()) {
      const createdProduct = await Product.create(product);
      res.status(201).json({ product: serializeProduct(req, createdProduct) });
      return;
    }

    db.products.unshift(product);
    res.status(201).json({ product: serializeProduct(req, product) });
  }),
);

app.put(
  '/api/products/:id',
  asyncHandler(async (req, res) => {
    if (await ensureDatabase()) {
      const existingProduct = await Product.findOne({ id: req.params.id }).lean();

      if (!existingProduct) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      const nextProduct = normalizeProductRecord(req.body, existingProduct);
      const updatedProduct = await Product.findOneAndUpdate({ id: req.params.id }, nextProduct, {
        new: true,
        lean: true,
      });

      res.json({ product: serializeProduct(req, updatedProduct) });
      return;
    }

    const productIndex = db.products.findIndex((product) => product.id === req.params.id);

    if (productIndex === -1) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    db.products[productIndex] = normalizeProductRecord(req.body, db.products[productIndex]);
    res.json({ product: serializeProduct(req, db.products[productIndex]) });
  }),
);

app.get(
  '/api/users',
  asyncHandler(async (_req, res) => {
    if (await ensureDatabase()) {
      const users = await User.find().sort({ createdAt: -1 }).lean();
      res.json({ users: users.map((user) => serializeUser(user)) });
      return;
    }

    res.json({
      users: [...db.users]
        .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
        .map((user) => serializeUser(user)),
    });
  }),
);

app.get(
  '/api/orders',
  asyncHandler(async (req, res) => {
    if (await ensureDatabase()) {
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      res.json({ orders: orders.map((order) => serializeOrder(req, order)) });
      return;
    }

    res.json({ orders: db.orders.map((order) => serializeOrder(req, order)) });
  }),
);

app.get(
  '/api/orders/track/:trackingCode',
  asyncHandler(async (req, res) => {
    let order = null;

    if (await ensureDatabase()) {
      order = await Order.findOne({ trackingCode: req.params.trackingCode }).lean();
    } else {
      order = db.orders.find((item) => item.trackingCode === req.params.trackingCode);
    }

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.json({ order: serializeOrder(req, order) });
  }),
);

app.post(
  '/api/orders',
  asyncHandler(async (req, res) => {
    const items = normalizeOrderItems(req.body.items || []);
    const customer = normalizeCustomer(req.body.customer || {});
    const totalAmount = Number(req.body.totalAmount || 0);
    const shipping = Number(req.body.shipping || 0);

    if (!items.length) {
      res.status(400).json({ message: 'Order must include items' });
      return;
    }

    const order = {
      id: makeId('order'),
      trackingCode: makeTrackingCode(),
      customer,
      items,
      shipping,
      totalAmount,
      status: 'Processing',
      paymentStatus: razorpayEnabled ? 'Awaiting payment' : 'Demo payment captured',
      createdAt: formatDate(),
    };

    const savedOrder =
      (await ensureDatabase()) ? await Order.create(order) : (() => {
        db.orders.unshift(order);
        return order;
      })();

    const orderResponse = serializeOrder(req, savedOrder);

    if (razorpayEnabled) {
      try {
        const gatewayOrder = await razorpay.orders.create({
          amount: totalAmount * 100,
          currency: 'INR',
          receipt: order.id,
        });

        res.status(201).json({
          order: orderResponse,
          amount: totalAmount,
          gatewayOrderId: gatewayOrder.id,
        });
        return;
      } catch (error) {
        res.status(500).json({ message: 'Unable to create Razorpay order', detail: error.message });
        return;
      }
    }

    res.status(201).json({
      order: orderResponse,
      amount: totalAmount,
      gatewayOrderId: null,
    });
  }),
);

app.get(
  '/api/custom-requests',
  asyncHandler(async (req, res) => {
    if (await ensureDatabase()) {
      const requests = await CustomRequest.find().sort({ createdAt: -1 }).lean();
      res.json({ requests: requests.map((request) => serializeRequest(req, request)) });
      return;
    }

    res.json({ requests: db.requests.map((request) => serializeRequest(req, request)) });
  }),
);

app.post(
  '/api/custom-requests',
  upload.single('inspirationImage'),
  asyncHandler(async (req, res) => {
    const request = {
      id: makeId('custom'),
      reference: `BES-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      name: String(req.body.name || '').trim(),
      email: normalizeEmail(req.body.email),
      phone: normalizePhone(req.body.phone),
      productType: String(req.body.productType || '').trim(),
      productName: String(req.body.productName || '').trim(),
      size: String(req.body.size || '').trim(),
      color: String(req.body.color || '').trim(),
      fabric: String(req.body.fabric || '').trim(),
      fitNotes: String(req.body.fitNotes || '').trim(),
      neckline: String(req.body.neckline || '').trim(),
      sleeve: String(req.body.sleeve || '').trim(),
      description: String(req.body.description || '').trim(),
      inspirationImage: await storeUploadedFile(req.file, 'custom-requests'),
      adminBudget: null,
      quoteNotes: '',
      quoteStatus: 'Pending review',
      quotedAt: null,
      createdAt: formatDate(),
    };

    if (await ensureDatabase()) {
      const createdRequest = await CustomRequest.create(request);
      res.status(201).json({ request: serializeRequest(req, createdRequest) });
      return;
    }

    db.requests.unshift(request);
    res.status(201).json({ request: serializeRequest(req, request) });
  }),
);

app.put(
  '/api/custom-requests/:id/quote',
  asyncHandler(async (req, res) => {
    const nextBudget =
      req.body.adminBudget === '' || req.body.adminBudget === null || req.body.adminBudget === undefined
        ? null
        : Number(req.body.adminBudget);

    const nextPatch = {
      adminBudget: Number.isNaN(nextBudget) ? null : nextBudget,
      quoteNotes: String(req.body.quoteNotes || ''),
      quoteStatus: nextBudget === null ? 'Pending review' : 'Quoted',
      quotedAt: nextBudget === null ? null : formatDate(),
    };

    if (await ensureDatabase()) {
      const existingRequest = await CustomRequest.findOne({ id: req.params.id }).lean();

      if (!existingRequest) {
        res.status(404).json({ message: 'Custom request not found.' });
        return;
      }

      const updatedRequest = await CustomRequest.findOneAndUpdate(
        { id: req.params.id },
        nextPatch,
        { new: true, lean: true },
      );

      res.json({ request: serializeRequest(req, updatedRequest) });
      return;
    }

    const requestIndex = db.requests.findIndex((request) => request.id === req.params.id);

    if (requestIndex === -1) {
      res.status(404).json({ message: 'Custom request not found.' });
      return;
    }

    db.requests[requestIndex] = {
      ...db.requests[requestIndex],
      adminBudget: Number.isNaN(nextBudget) ? db.requests[requestIndex].adminBudget : nextBudget,
      quoteNotes: nextPatch.quoteNotes,
      quoteStatus: nextPatch.quoteStatus,
      quotedAt: nextPatch.quotedAt,
    };

    res.json({ request: serializeRequest(req, db.requests[requestIndex]) });
  }),
);

app.get(
  '/api/dashboard',
  asyncHandler(async (_req, res) => {
    if (await ensureDatabase()) {
      const [productsCount, ordersCount, usersCount, revenue] = await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        User.countDocuments(),
        Order.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' },
            },
          },
        ]),
      ]);

      const totalRevenue = revenue[0]?.total || 0;

      res.json({
        stats: [
          { label: 'Products', value: String(productsCount) },
          { label: 'Orders', value: String(ordersCount) },
          { label: 'Users', value: String(usersCount) },
          { label: 'Revenue', value: `INR ${totalRevenue.toLocaleString('en-IN')}` },
        ],
      });
      return;
    }

    const totalRevenue = db.orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      stats: [
        { label: 'Products', value: String(db.products.length) },
        { label: 'Orders', value: String(db.orders.length) },
        { label: 'Users', value: String(db.users.length) },
        { label: 'Revenue', value: `INR ${totalRevenue.toLocaleString('en-IN')}` },
      ],
    });
  }),
);

if (!hasClientBuild) {
  app.get('/', (_req, res) => {
    res.send('MyCraft API running');
  });
}

if (hasClientBuild) {
  app.get(/^(?!\/api|\/uploads|\/catalog-assets).*/, (_req, res) => {
    res.sendFile(clientIndexFile);
  });
}

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'Uploaded file is too large.' });
      return;
    }
  }

  if (error?.message === 'Not allowed by CORS') {
    res.status(403).json({ message: 'This origin is not allowed to access the API.' });
    return;
  }

  if (error?.code === 11000) {
    res.status(409).json({ message: 'A record with those details already exists.' });
    return;
  }

  console.error(error);
  res.status(500).json({
    message: 'Something went wrong on the server.',
    detail: process.env.NODE_ENV === 'production' ? undefined : error.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
