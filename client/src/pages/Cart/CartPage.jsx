import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { buildCartItemKey, useCart } from '../../context/CartContext';
import { formatCurrency, formatSelectedOptions } from '../../lib/format';
import CustomizedProductPreview from '../../components/CustomizedProductPreview';

function CartPage() {
  const { cart, subtotal, shipping, total, updateQuantity, removeFromCart } = useCart();

  return (
    <div className="section-shell py-10">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="luxury-panel rounded-[32px] border border-white/10 p-8">
          <h1 className="headline-font text-5xl font-semibold text-stone-100">Shopping Cart</h1>
          <div className="mt-8 space-y-4">
            {cart.length === 0 ? (
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-stone-400">
                Your cart is empty. Explore the collections and add premium pieces.
              </div>
            ) : (
              cart.map((item) => {
                const key = buildCartItemKey(item);
                return (
                  <div key={key} className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4 md:flex-row">
                    {item.customization ? (
                      <CustomizedProductPreview
                        imageSrc={item.image}
                        productName={item.name}
                        customization={item.customization}
                        priority="compact"
                        className="h-28 w-28 rounded-[20px]"
                        imageClassName="h-full w-full object-cover"
                      />
                    ) : (
                      <img src={item.image} alt={item.name} className="h-28 w-28 rounded-[20px] object-cover" />
                    )}
                    <div className="flex flex-1 flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <p className="font-semibold text-stone-100">{item.name}</p>
                        <p className="mt-2 text-sm text-stone-500">
                          {formatSelectedOptions(item.selectedOptions, {
                            size: item.size,
                            color: item.color,
                          })}
                        </p>
                        {item.customization && (
                          <p className="mt-1 text-xs text-cyan-300">
                            Customized{item.customization.text ? ` • ${item.customization.text}` : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => updateQuantity(key, item.quantity - 1)} className="rounded-full border border-white/10 p-2">
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(key, item.quantity + 1)} className="rounded-full border border-white/10 p-2">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-stone-100">{formatCurrency(item.price * item.quantity)}</p>
                        <button type="button" onClick={() => removeFromCart(key)} className="mt-2 inline-flex items-center gap-2 text-sm text-red-300">
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <aside className="luxury-panel h-fit rounded-[32px] border border-white/10 p-8">
          <h2 className="text-xl font-semibold text-stone-100">Order Summary</h2>
          <div className="mt-6 space-y-4 text-sm text-stone-400">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-base font-semibold text-stone-100">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <Link to="/checkout" className="mt-8 inline-flex w-full justify-center rounded-full bg-amber-200 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black">
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default CartPage;
