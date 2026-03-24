import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

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

    setCart((previous) => {
      const existing = previous.find(
        (item) => item.id === product.id && item.size === size && item.color === color && JSON.stringify(item.customization) === JSON.stringify(customization),
      );

      if (existing) {
        return previous.map((item) =>
          item.id === existing.id && item.size === size && item.color === color && JSON.stringify(item.customization) === JSON.stringify(customization)
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...previous,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: options.previewImage || product.images?.[0],
          size,
          color,
          quantity,
          customization,
        },
      ];
    });
  };

  const updateQuantity = (itemKey, quantity) => {
    setCart((previous) =>
      previous
        .map((item) =>
          `${item.id}-${item.size}-${item.color}-${JSON.stringify(item.customization)}` === itemKey
            ? { ...item, quantity: Math.max(1, quantity) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (itemKey) => {
    setCart((previous) =>
      previous.filter((item) => `${item.id}-${item.size}-${item.color}-${JSON.stringify(item.customization)}` !== itemKey),
    );
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

  const value = useMemo(() => {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const shipping = cart.length ? 250 : 0;
    return {
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
  }, [cart, wishlist]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
