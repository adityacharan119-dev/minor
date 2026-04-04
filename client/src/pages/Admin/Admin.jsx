import { useEffect, useState } from 'react';
import {
  createProduct,
  fetchCustomRequests,
  fetchDashboard,
  fetchOrders,
  fetchProducts,
  fetchUsers,
  updateCustomRequestQuote,
  updateProduct,
} from '../../lib/api';
import { formatCurrency } from '../../lib/format';

const initialForm = {
  name: '',
  collection: 'streetwear',
  subcategory: '',
  price: '',
  rating: '4.8',
  description: '',
  colors: 'Jet Black, Soft White',
  sizes: 'S, M, L, XL',
  featured: false,
};

function Admin() {
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [quoteDrafts, setQuoteDrafts] = useState({});
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    const [dashboardData, productData, orderData, userData, requestData] = await Promise.all([
      fetchDashboard(),
      fetchProducts(),
      fetchOrders(),
      fetchUsers(),
      fetchCustomRequests(),
    ]);
    setDashboard(dashboardData);
    setProducts(productData.products);
    setOrders(orderData.orders);
    setUsers(userData.users);
    setRequests(requestData.requests);
    setQuoteDrafts(
      Object.fromEntries(
        requestData.requests.map((request) => [
          request.id,
          {
            adminBudget: request.adminBudget ?? '',
            quoteNotes: request.quoteNotes || '',
          },
        ]),
      ),
    );
  };

  useEffect(() => {
    let ignore = false;

    const hydrate = async () => {
      const [dashboardData, productData, orderData, userData, requestData] = await Promise.all([
        fetchDashboard(),
        fetchProducts(),
        fetchOrders(),
        fetchUsers(),
        fetchCustomRequests(),
      ]);

      if (ignore) {
        return;
      }

      setDashboard(dashboardData);
      setProducts(productData.products);
      setOrders(orderData.orders);
      setUsers(userData.users);
      setRequests(requestData.requests);
      setQuoteDrafts(
        Object.fromEntries(
          requestData.requests.map((request) => [
            request.id,
            {
              adminBudget: request.adminBudget ?? '',
              quoteNotes: request.quoteNotes || '',
            },
          ]),
        ),
      );
    };

    void hydrate();

    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      collection: product.collection,
      subcategory: product.subcategory,
      price: String(product.price),
      rating: String(product.rating),
      description: product.description,
      colors: product.colors.join(', '),
      sizes: product.sizes.join(', '),
      featured: product.featured,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      rating: Number(form.rating),
      colors: form.colors.split(',').map((item) => item.trim()).filter(Boolean),
      sizes: form.sizes.split(',').map((item) => item.trim()).filter(Boolean),
    };

    if (editingId) {
      await updateProduct(editingId, payload);
    } else {
      await createProduct(payload);
    }

    setForm(initialForm);
    setEditingId(null);
    await loadData();
  };

  const handleQuoteChange = (requestId, field, value) => {
    setQuoteDrafts((previous) => ({
      ...previous,
      [requestId]: {
        ...previous[requestId],
        [field]: value,
      },
    }));
  };

  const handleQuoteSave = async (requestId) => {
    const draft = quoteDrafts[requestId] || { adminBudget: '', quoteNotes: '' };
    await updateCustomRequestQuote(requestId, draft);
    await loadData();
  };

  return (
    <div className="section-shell py-10">
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-6">
          <div className="luxury-panel rounded-[32px] border border-white/10 p-8">
            <p className="text-[11px] uppercase tracking-[0.35em] text-amber-200">Admin Dashboard</p>
            <h1 className="headline-font mt-4 text-5xl font-semibold text-stone-100">Operate the house.</h1>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {dashboard?.stats.map((stat) => (
                <div key={stat.label} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-stone-500">{stat.label}</p>
                  <p className="mt-3 text-2xl font-bold text-stone-100">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="luxury-panel rounded-[32px] border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-stone-100">{editingId ? 'Edit Product' : 'Add Product'}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ['name', 'Product Name'],
                ['subcategory', 'Subcategory'],
                ['price', 'Price'],
                ['rating', 'Rating'],
              ].map(([name, label]) => (
                <label key={name} className="space-y-2">
                  <span className="text-sm text-stone-400">{label}</span>
                  <input name={name} value={form[name]} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
                </label>
              ))}
              <label className="space-y-2">
                <span className="text-sm text-stone-400">Collection</span>
                <select name="collection" value={form.collection} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40">
                  <option value="streetwear">Streetwear</option>
                  <option value="modern">Modern</option>
                  <option value="home-living">Home Living</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-stone-400">Colors</span>
                <input name="colors" value={form.colors} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm text-stone-400">Sizes</span>
                <input name="sizes" value={form.sizes} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm text-stone-400">Description</span>
                <textarea name="description" value={form.description} onChange={handleChange} rows="4" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
              </label>
              <label className="flex items-center gap-3 text-sm text-stone-300 md:col-span-2">
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
                Mark as featured
              </label>
            </div>
            <button type="submit" className="mt-6 rounded-full bg-amber-200 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black">
              {editingId ? 'Update Product' : 'Create Product'}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="luxury-panel rounded-[32px] border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-stone-100">Products</h2>
            <div className="mt-5 space-y-3">
              {products.slice(0, 8).map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-4">
                    <img src={product.images[0]} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" />
                    <div>
                      <p className="font-semibold text-stone-100">{product.name}</p>
                      <p className="text-sm text-stone-500">{product.collection} • {product.subcategory}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-stone-100">{formatCurrency(product.price)}</p>
                    <button type="button" onClick={() => startEdit(product)} className="text-sm text-amber-200">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="luxury-panel rounded-[32px] border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-stone-100">Recent Orders</h2>
            <div className="mt-5 space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-stone-100">{order.customer.name}</p>
                      <p className="text-sm text-stone-500">{order.trackingCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-stone-100">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-sm text-stone-500">{order.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="luxury-panel rounded-[32px] border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-stone-100">Users</h2>
            <div className="mt-5 space-y-3">
              {users.length ? (
                users.slice(0, 10).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <p className="font-semibold text-stone-100">{user.name}</p>
                      <p className="text-sm text-stone-500">{user.email}</p>
                      <p className="text-sm text-stone-500">{user.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-stone-300">Customer</p>
                      <p className="text-sm text-stone-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleString('en-IN') : 'Unknown'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-stone-400">
                  No registered customers yet.
                </div>
              )}
            </div>
          </div>

          <div className="luxury-panel rounded-[32px] border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-stone-100">Custom Requests</h2>
            <div className="mt-5 space-y-3">
              {requests.slice(0, 5).map((request) => (
                <div key={request.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-stone-100">{request.name}</p>
                        <p className="text-sm text-stone-500">
                          {request.productType} • {request.productName || 'General custom request'}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-stone-500">
                          {request.quoteStatus}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-stone-300">{request.reference}</p>
                        <p className="text-sm text-stone-500">{request.phone}</p>
                        {request.email ? <p className="text-sm text-stone-500">{request.email}</p> : null}
                        {request.adminBudget !== null ? (
                          <p className="mt-2 font-semibold text-amber-100">
                            {formatCurrency(request.adminBudget)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                      <div className="space-y-2 text-sm text-stone-400">
                        <p>Size: <span className="text-stone-200">{request.size || 'Not specified'}</span></p>
                        <p>Color: <span className="text-stone-200">{request.color || 'Not specified'}</span></p>
                        <p>Fabric: <span className="text-stone-200">{request.fabric || 'Not specified'}</span></p>
                        <p>Fit Notes: <span className="text-stone-200">{request.fitNotes || 'Not specified'}</span></p>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="number"
                          min="0"
                          value={quoteDrafts[request.id]?.adminBudget ?? ''}
                          onChange={(event) =>
                            handleQuoteChange(request.id, 'adminBudget', event.target.value)
                          }
                          placeholder="Set admin budget"
                          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-amber-200/40"
                        />
                        <textarea
                          rows="3"
                          value={quoteDrafts[request.id]?.quoteNotes ?? ''}
                          onChange={(event) =>
                            handleQuoteChange(request.id, 'quoteNotes', event.target.value)
                          }
                          placeholder="Quote notes for cloth, fitting, and finishing"
                          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-amber-200/40"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuoteSave(request.id)}
                          className="rounded-full bg-amber-200 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-black"
                        >
                          Save Quote
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Admin;
