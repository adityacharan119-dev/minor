/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const normalizeSelectedOptions = (selectedOptions = {}) =>
  Object.fromEntries(
    Object.entries(selectedOptions || {})
      .map(([key, value]) => [String(key).trim(), String(value).trim()])
      .filter(([key, value]) => key && value),
  );

export const buildCartItemKey = (item) =>
  `${item.id}-${JSON.stringify(item.selectedOptions || { size: item.size, color: item.color })}-${JSON.stringify(item.customization || null)}`;

const readStorage = (key, fallback) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => readStorage('vantage-cart', []));
  const [wishlist, setWishlist] = useState(() => readStorage('vantage-wishlist', []));

  useEffect(() => {
    window.localStorage.setItem('vantage-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem('vantage-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product, options = {}) => {
    const size = options.size || product.sizes?.[0] || 'One Size';
    const color = options.color || product.colors?.[0] || 'Default';
    const quantity = options.quantity || 1;
    const customization = options.customization || null;
    const selectedOptions = normalizeSelectedOptions(
      Object.keys(options.selectedOptions || {}).length
        ? options.selectedOptions
        : {
            size,
            color,
          },
    );

    setCart((previous) => {
      const nextItem = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: options.previewImage || product.images?.[0],
        size: selectedOptions.size || size,
        color: selectedOptions.color || color,
        selectedOptions,
        quantity,
        customization,
      };

      const existing = previous.find((item) => buildCartItemKey(item) === buildCartItemKey(nextItem));

      if (existing) {
        return previous.map((item) =>
          buildCartItemKey(item) === buildCartItemKey(existing)
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...previous, nextItem];
    });
  };

  const updateQuantity = (itemKey, quantity) => {
    setCart((previous) =>
      previous
        .map((item) => (buildCartItemKey(item) === itemKey ? { ...item, quantity: Math.max(1, quantity) } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (itemKey) => {
    setCart((previous) => previous.filter((item) => buildCartItemKey(item) !== itemKey));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist((previous) =>
      previous.some((item) => item.id === product.id)
        ? previous.filter((item) => item.id !== product.id)
        : [...previous, product],
    );
  };

  const isWishlisted = (id) => wishlist.some((item) => item.id === id);

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = cart.length ? 250 : 0;
  const value = {
    cart,
    wishlist,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isWishlisted,
    subtotal,
    shipping,
    total: subtotal + shipping,
    cartCount: cart.reduce((totalItems, item) => totalItems + item.quantity, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
