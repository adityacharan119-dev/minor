import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, fetchRazorpayConfig } from '../../lib/api';
import { buildCartItemKey, useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatSelectedOptions } from '../../lib/format';
import CustomizedProductPreview from '../../components/CustomizedProductPreview';

const initialCustomer = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  pincode: '',
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const existing = document.querySelector('script[data-razorpay="true"]');
    if (existing) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpay = 'true';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function CheckoutPage() {
  const { cart, total, shipping, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(initialCustomer);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    setCustomer((previous) => ({
      ...previous,
      name: user.name || previous.name,
      email: user.email || previous.email,
      phone: user.phone || previous.phone,
    }));
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCustomer((previous) => ({ ...previous, [name]: value }));
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    if (!cart.length) {
      setMessage('Add products to cart before checkout.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const orderResponse = await createOrder({ items: cart, customer, shipping, totalAmount: total });
      const config = await fetchRazorpayConfig();
      const razorpayLoaded = await loadRazorpayScript();

      if (razorpayLoaded && config.enabled && orderResponse.gatewayOrderId && window.Razorpay) {
        const razorpay = new window.Razorpay({
          key: config.key,
          amount: orderResponse.amount * 100,
          currency: 'INR',
          name: 'MyCraft',
          description: 'Custom product order',
          order_id: orderResponse.gatewayOrderId,
          handler: () => {
            clearCart();
            navigate(`/track-order/${orderResponse.order.trackingCode}`);
          },
          prefill: { name: customer.name, email: customer.email, contact: customer.phone },
          theme: { color: '#d4af37' },
        });
        razorpay.open();
      } else {
        clearCart();
        navigate(`/track-order/${orderResponse.order.trackingCode}`);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-shell py-10">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleCheckout} className="luxury-panel rounded-[32px] border border-white/10 p-8">
          <h1 className="headline-font text-5xl font-semibold text-stone-100">Checkout</h1>
          {user ? (
            <div className="mt-5 rounded-[22px] border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
              Signed in as {user.name}. Your email and mobile are prefilled from the customer account.
            </div>
          ) : null}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              ['name', 'Full Name'],
              ['email', 'Email'],
              ['phone', 'Phone'],
              ['city', 'City'],
              ['pincode', 'Pincode'],
            ].map(([name, label]) => (
              <label key={name} className="space-y-2">
                <span className="text-sm text-stone-400">{label}</span>
                <input required name={name} value={customer[name]} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
              </label>
            ))}
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm text-stone-400">Address</span>
              <textarea required name="address" value={customer.address} onChange={handleChange} rows="4" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
            </label>
          </div>
          {message ? <p className="mt-5 text-sm text-red-300">{message}</p> : null}
          <button type="submit" disabled={submitting} className="mt-6 rounded-full bg-amber-200 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black disabled:opacity-60">
            {submitting ? 'Processing' : 'Pay with Razorpay'}
          </button>
        </form>

        <aside className="luxury-panel rounded-[32px] border border-white/10 p-8">
          <h2 className="text-xl font-semibold text-stone-100">Order Summary</h2>
          <div className="mt-6 space-y-4">
            {cart.map((item) => (
              <div key={buildCartItemKey(item)} className="flex items-center gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                {item.customization ? (
                  <CustomizedProductPreview
                    imageSrc={item.image}
                    productName={item.name}
                    customization={item.customization}
                    priority="compact"
                    className="h-16 w-16 rounded-2xl"
                    imageClassName="h-full w-full object-cover"
                  />
                ) : (
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded-2xl object-cover" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-stone-100">{item.name}</p>
                  <p className="text-sm text-stone-500">
                    {formatSelectedOptions(item.selectedOptions, {
                      size: item.size,
                      color: item.color,
                    })}{' '}
                    • {item.quantity}x
                  </p>
                  {item.customization ? (
                    <p className="mt-1 text-xs text-cyan-300">
                      Customized{item.customization.text ? ` • ${item.customization.text}` : ''}
                    </p>
                  ) : null}
                </div>
                <p className="text-sm text-stone-200">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm text-stone-400">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-stone-100">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;
