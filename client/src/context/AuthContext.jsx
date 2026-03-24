import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginCustomer, requestSignupVerification, verifySignupCode } from '../lib/api';

const AuthContext = createContext(null);

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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStorage('adi-customer', null));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (user) {
      window.localStorage.setItem('adi-customer', JSON.stringify(user));
      return;
    }

    window.localStorage.removeItem('adi-customer');
  }, [user]);

  const requestSignup = async (payload) => requestSignupVerification(payload);

  const verifySignup = async (payload) => {
    const data = await verifySignupCode(payload);
    setUser(data.user);
    return data;
  };

  const login = async (payload) => {
    const data = await loginCustomer(payload);
    setUser(data.user);
    return data;
  };

  const logout = () => setUser(null);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      requestSignup,
      verifySignup,
      login,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
