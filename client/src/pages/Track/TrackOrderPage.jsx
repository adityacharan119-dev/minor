import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { trackOrder } from '../../lib/api';
import { formatCurrency } from '../../lib/format';

function TrackOrderPage() {
  const { trackingCode: initialCode } = useParams();
  const navigate = useNavigate();
  const [trackingCode, setTrackingCode] = useState(initialCode || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialCode) {
      return;
    }
    trackOrder(initialCode)
      .then((response) => {
        setOrder(response.order);
        setError('');
      })
      .catch(() => setError('Order not found.'));
  }, [initialCode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!trackingCode.trim()) {
      return;
    }
    navigate(`/track-order/${trackingCode.trim()}`);
  };

  return (
    <div className="section-shell py-10">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={handleSubmit} className="luxury-panel rounded-[32px] border border-white/10 p-8">
          <p className="text-[11px] uppercase tracking-[0.35em] text-amber-200">Order Tracking</p>
          <h1 className="headline-font mt-4 text-5xl font-semibold text-stone-100">Track your order.</h1>
          <input value={trackingCode} onChange={(event) => setTrackingCode(event.target.value)} placeholder="Enter tracking code" className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
          <button type="submit" className="mt-5 rounded-full bg-amber-200 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black">
            Track
          </button>
          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        </form>

        <div className="luxury-panel rounded-[32px] border border-white/10 p-8">
          {!order ? (
            <p className="text-stone-400">Order details appear here after a valid tracking search.</p>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-stone-100">{order.customer.name}</h2>
              <p className="mt-2 text-sm text-stone-500">{order.trackingCode}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-stone-500">Status</p>
                  <p className="mt-2 font-semibold text-stone-100">{order.status}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-stone-500">Payment</p>
                  <p className="mt-2 font-semibold text-stone-100">{order.paymentStatus}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-stone-500">Total</p>
                  <p className="mt-2 font-semibold text-stone-100">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {order.items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-stone-100">{item.name}</p>
                        <p className="text-sm text-stone-500">{item.size} • {item.color} • {item.quantity}x</p>
                      </div>
                      <p className="text-sm text-stone-200">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrackOrderPage;
