const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const os = require('os');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
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

const customizationSchema = new mongoose.Schema(
  {
    text: String,
    textColor: String,
    textPosition: positionSchema,
    imageSrc: String,
    imagePosition: positionSchema,
    imageScale: Number,
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
    price: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 },
    colors: { type: [String], default: ['Black'] },
    sizes: { type: [String], default: ['One Size'] },
    description: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    isCustomizable: { type: Boolean, default: true },
    primaryImage: { type: String, default: '' },
    images: { type: [String], default: [] },
  },
  schemaOptions,
);

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
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

let databasePromise = null;
let seedPromise = null;

const makeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const formatDate = () => new Date().toISOString();
const makeTrackingCode = () => `MYC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const makeVerificationCode = () => String(Math.floor(100000 + Math.random() * 900000));
const normalizeEmail = (value = '') => String(value).trim().toLowerCase();
const normalizePhone = (value = '') => String(value).replace(/\D/g, '');
const trimTrailingSlash = (value = '') => String(value).replace(/\/+$/, '');
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

const toPlainObject = (value) => (value?.toObject ? value.toObject() : value);

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

  return {
    text: String(value.text || '').trim(),
    textColor: String(value.textColor || '#ffffff'),
    textPosition: {
      x: Number(value.textPosition?.x ?? 50),
      y: Number(value.textPosition?.y ?? 50),
    },
    imageSrc: String(value.imageSrc || ''),
    imagePosition: {
      x: Number(value.imagePosition?.x ?? 50),
      y: Number(value.imagePosition?.y ?? 50),
    },
    imageScale: Number(value.imageScale ?? 1),
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
  const nextRecord = {
    id: current?.id || makeId('prod'),
    slug:
      payload.slug !== undefined
        ? buildSlug(payload.slug)
        : current?.slug || buildSlug(nextName),
    name: nextName,
    collection: nextCollection,
    subcategory: nextSubcategory,
    price: Number(payload.price ?? current?.price ?? 0),
    rating: Number(payload.rating ?? current?.rating ?? 4.8),
    colors: normalizeList(payload.colors, current?.colors || ['Black']),
    sizes: normalizeList(payload.sizes, current?.sizes || ['One Size']),
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
          : nextCollection !== 'jewelry',
    primaryImage: nextPrimaryImage,
  };

  const shouldRefreshImages =
    !current ||
    nextRecord.name !== current.name ||
    nextRecord.collection !== current.collection ||
    nextRecord.subcategory !== current.subcategory ||
    nextRecord.primaryImage !== current.primaryImage;

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
    const productCount = await Product.estimatedDocumentCount();
    if (productCount === 0) {
      await Product.insertMany(seedProducts);
    }
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
      .connect(process.env.MONGODB_URI)
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

    if (!name || !email || !phone) {
      res.status(400).json({ message: 'Name, email, and mobile number are required.' });
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

      const pendingSignup = await PendingSignup.create({
        id: makeId('pending'),
        name,
        email,
        phone,
        verificationCode: makeVerificationCode(),
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      res.status(201).json({
        pendingSignupId: pendingSignup.id,
        expiresAt: new Date(pendingSignup.expiresAt).toISOString(),
        verificationCode: pendingSignup.verificationCode,
        message: 'Verification code generated successfully.',
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
      verificationCode: makeVerificationCode(),
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    db.pendingSignups.unshift(pendingSignup);

    res.status(201).json({
      pendingSignupId: pendingSignup.id,
      expiresAt: new Date(pendingSignup.expiresAt).toISOString(),
      verificationCode: pendingSignup.verificationCode,
      message: 'Verification code generated successfully.',
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
        createdAt: formatDate(),
      });

      await PendingSignup.deleteOne({ id: pendingSignupId });
      res.status(201).json({ user: toPlainObject(user) });
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
      createdAt: formatDate(),
    };

    db.pendingSignups.splice(signupIndex, 1);
    db.users.unshift(user);

    res.status(201).json({ user });
  }),
);

app.post(
  '/api/auth/login',
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const phone = normalizePhone(req.body.phone);

    if (!email || !phone) {
      res.status(400).json({ message: 'Email and mobile number are required to log in.' });
      return;
    }

    if (await ensureDatabase()) {
      const user = await User.findOne({ email, phone }).lean();

      if (!user) {
        res.status(404).json({ message: 'No customer account matches that email and mobile number.' });
        return;
      }

      res.json({ user });
      return;
    }

    const user = db.users.find((entry) => entry.email === email && entry.phone === phone);

    if (!user) {
      res.status(404).json({ message: 'No customer account matches that email and mobile number.' });
      return;
    }

    res.json({ user });
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
    const collections = ['traditional', 'modern', 'streetwear', 'jewelry'];

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
      const [productsCount, ordersCount, revenue] = await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
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
