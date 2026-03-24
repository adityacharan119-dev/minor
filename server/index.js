const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const { createProductImages, seedProducts } = require('./data');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const uploadDirectory = path.join(__dirname, 'uploads');
const catalogAssetDirectory = path.join(__dirname, '..', 'client', 'src', 'assets');

fs.mkdirSync(uploadDirectory, { recursive: true });

const upload = multer({ dest: uploadDirectory });
const razorpayEnabled =
  Boolean(process.env.RAZORPAY_KEY_ID) &&
  Boolean(process.env.RAZORPAY_KEY_SECRET) &&
  !String(process.env.RAZORPAY_KEY_ID).includes('placeholder');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(uploadDirectory));
app.use('/catalog-assets', express.static(catalogAssetDirectory));

const db = {
  products: [...seedProducts],
  orders: [],
  requests: [],
  users: [],
  pendingSignups: [],
};

if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connection established'))
    .catch((error) => console.log(`MongoDB connection failed: ${error.message}`));
}

const makeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const formatDate = () => new Date().toISOString();
const makeTrackingCode = () => `MYC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const makeVerificationCode = () => String(Math.floor(100000 + Math.random() * 900000));
const normalizeEmail = (value = '') => String(value).trim().toLowerCase();
const normalizePhone = (value = '') => String(value).replace(/\D/g, '');

app.get('/', (_req, res) => {
  res.send('MyCraft API running');
});

app.post('/api/auth/signup/request', (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = normalizeEmail(req.body.email);
  const phone = normalizePhone(req.body.phone);

  if (!name || !email || !phone) {
    res.status(400).json({ message: 'Name, email, and mobile number are required.' });
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
});

app.post('/api/auth/signup/verify', (req, res) => {
  const pendingSignupId = String(req.body.pendingSignupId || '').trim();
  const verificationCode = String(req.body.verificationCode || '').trim();
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
});

app.post('/api/auth/login', (req, res) => {
  const email = normalizeEmail(req.body.email);
  const phone = normalizePhone(req.body.phone);

  if (!email || !phone) {
    res.status(400).json({ message: 'Email and mobile number are required to log in.' });
    return;
  }

  const user = db.users.find((entry) => entry.email === email && entry.phone === phone);

  if (!user) {
    res.status(404).json({ message: 'No customer account matches that email and mobile number.' });
    return;
  }

  res.json({ user });
});

app.get('/api/config/razorpay', (_req, res) => {
  res.json({
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    enabled: razorpayEnabled,
  });
});

app.get('/api/collections/summary', (_req, res) => {
  const summary = ['traditional', 'modern', 'streetwear', 'jewelry'].map((collection) => ({
    collection,
    count: db.products.filter((product) => product.collection === collection).length,
  }));

  res.json({ collections: summary });
});

app.get('/api/products', (req, res) => {
  const { collection, search = '', featured, limit } = req.query;
  let products = [...db.products];

  if (collection) {
    products = products.filter((product) => product.collection === collection);
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

  res.json({ products });
});

app.get('/api/products/:slug', (req, res) => {
  const product = db.products.find((item) => item.slug === req.params.slug);

  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  res.json({ product });
});

app.post('/api/products', (req, res) => {
  const product = {
    id: makeId('prod'),
    slug: String(req.body.name || 'new-product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: req.body.name,
    collection: req.body.collection,
    subcategory: req.body.subcategory,
    price: Number(req.body.price || 0),
    rating: Number(req.body.rating || 4.8),
    colors: req.body.colors || ['Black'],
    sizes: req.body.sizes || ['One Size'],
    description: req.body.description || 'New product added from admin dashboard.',
    featured: Boolean(req.body.featured),
    isCustomizable:
      req.body.isCustomizable !== undefined
        ? Boolean(req.body.isCustomizable)
        : req.body.collection !== 'jewelry',
  };

  product.images = createProductImages(product);

  db.products.unshift(product);
  res.status(201).json({ product });
});

app.put('/api/products/:id', (req, res) => {
  const productIndex = db.products.findIndex((product) => product.id === req.params.id);

  if (productIndex === -1) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  db.products[productIndex] = {
    ...db.products[productIndex],
    ...req.body,
    price: Number(req.body.price ?? db.products[productIndex].price),
    rating: Number(req.body.rating ?? db.products[productIndex].rating),
  };

  res.json({ product: db.products[productIndex] });
});

app.get('/api/orders', (_req, res) => {
  res.json({ orders: db.orders });
});

app.get('/api/orders/track/:trackingCode', (req, res) => {
  const order = db.orders.find((item) => item.trackingCode === req.params.trackingCode);

  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  res.json({ order });
});

app.post('/api/orders', async (req, res) => {
  const { items = [], customer = {}, totalAmount = 0, shipping = 0 } = req.body;

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
    totalAmount: Number(totalAmount),
    status: 'Processing',
    paymentStatus: razorpayEnabled ? 'Awaiting payment' : 'Demo payment captured',
    createdAt: formatDate(),
  };

  db.orders.unshift(order);

  if (razorpayEnabled) {
    try {
      const gatewayOrder = await razorpay.orders.create({
        amount: Number(totalAmount) * 100,
        currency: 'INR',
        receipt: order.id,
      });

      res.status(201).json({
        order,
        amount: Number(totalAmount),
        gatewayOrderId: gatewayOrder.id,
      });
      return;
    } catch (error) {
      res.status(500).json({ message: 'Unable to create Razorpay order', detail: error.message });
      return;
    }
  }

  res.status(201).json({
    order,
    amount: Number(totalAmount),
    gatewayOrderId: null,
  });
});

app.get('/api/custom-requests', (_req, res) => {
  res.json({ requests: db.requests });
});

app.post('/api/custom-requests', upload.single('inspirationImage'), (req, res) => {
  const request = {
    id: makeId('custom'),
    reference: `BES-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    name: req.body.name,
    email: normalizeEmail(req.body.email),
    phone: req.body.phone,
    productType: req.body.productType,
    productName: req.body.productName || '',
    size: req.body.size,
    color: req.body.color,
    fabric: req.body.fabric || '',
    fitNotes: req.body.fitNotes || '',
    neckline: req.body.neckline || '',
    sleeve: req.body.sleeve || '',
    description: req.body.description,
    inspirationImage: req.file ? `/uploads/${req.file.filename}` : null,
    adminBudget: null,
    quoteNotes: '',
    quoteStatus: 'Pending review',
    quotedAt: null,
    createdAt: formatDate(),
  };

  db.requests.unshift(request);
  res.status(201).json({ request });
});

app.put('/api/custom-requests/:id/quote', (req, res) => {
  const requestIndex = db.requests.findIndex((request) => request.id === req.params.id);

  if (requestIndex === -1) {
    res.status(404).json({ message: 'Custom request not found.' });
    return;
  }

  const nextBudget =
    req.body.adminBudget === '' || req.body.adminBudget === null || req.body.adminBudget === undefined
      ? null
      : Number(req.body.adminBudget);

  db.requests[requestIndex] = {
    ...db.requests[requestIndex],
    adminBudget: Number.isNaN(nextBudget) ? db.requests[requestIndex].adminBudget : nextBudget,
    quoteNotes: String(req.body.quoteNotes || ''),
    quoteStatus: nextBudget === null ? 'Pending review' : 'Quoted',
    quotedAt: nextBudget === null ? null : formatDate(),
  };

  res.json({ request: db.requests[requestIndex] });
});

app.get('/api/dashboard', (_req, res) => {
  const totalRevenue = db.orders.reduce((sum, order) => sum + order.totalAmount, 0);

  res.json({
    stats: [
      { label: 'Products', value: String(db.products.length) },
      { label: 'Orders', value: String(db.orders.length) },
      { label: 'Revenue', value: `INR ${totalRevenue.toLocaleString('en-IN')}` },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
