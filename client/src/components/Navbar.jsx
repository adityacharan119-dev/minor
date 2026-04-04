import { useState } from 'react';
import { Heart, LogOut, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import brandEmblem from '../assets/brand-emblem.svg';

const navItems = [
  { label: 'Streetwear', to: '/streetwear' },
  { label: 'Modern', to: '/modern' },
  { label: 'Home Living', to: '/home-living' },
  { label: 'Custom', to: '/custom' },
];

function Navbar() {
  const { cartCount, wishlist } = useCart();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const customerName = user?.name?.split(' ')[0] || 'Customer';

  const handleSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) {
      return;
    }
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <>
      <div className="border-b border-white/10 bg-black px-4 py-2 text-center text-[11px] uppercase tracking-[0.35em] text-stone-400">
        Live photo preview for tees, hoodies, pillows, blankets, mugs, and frames.
      </div>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="section-shell flex h-20 items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={brandEmblem}
              alt="MyCraft brand emblem"
              className="h-12 w-12 rounded-2xl border border-white/10 object-cover shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            />
            <div>
              <p className="headline-font text-2xl font-semibold tracking-[0.2em] text-stone-100">MYCRAFT</p>
              <p className="text-[10px] uppercase tracking-[0.4em] text-stone-500">Custom Print Studio</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm uppercase tracking-[0.28em] transition ${
                    isActive ? 'text-amber-100' : 'text-stone-400 hover:text-stone-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden flex-1 justify-end lg:flex">
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-sm items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2"
            >
              <Search size={16} className="text-stone-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-sm text-stone-100 outline-none placeholder:text-stone-500"
                placeholder="Search tees, hoodies, pillows, mugs"
              />
            </form>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-stone-300 md:inline-flex">
                  <UserRound size={14} />
                  {customerName}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-stone-300 transition hover:border-white/25 md:inline-flex"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-stone-300 transition hover:border-white/25 md:inline-flex"
              >
                Login
              </Link>
            )}
            <Link
              to="/search"
              className="rounded-full border border-white/10 bg-white/5 p-3 text-stone-200 transition hover:border-white/25 lg:hidden"
            >
              <Search size={16} />
            </Link>
            <Link
              to="/track-order"
              className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-stone-300 transition hover:border-white/25 md:inline-flex"
            >
              Track
            </Link>
            <Link
              to="/cart"
              className="relative rounded-full border border-white/10 bg-white/5 p-3 text-stone-200 transition hover:border-white/25"
            >
              <ShoppingBag size={16} />
              {cartCount ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-black">
                  {cartCount}
                </span>
              ) : null}
            </Link>
            <Link
              to="/search"
              className="relative rounded-full border border-white/10 bg-white/5 p-3 text-stone-200 transition hover:border-white/25"
            >
              <Heart size={16} />
              {wishlist.length ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-cyan-300 px-1.5 py-0.5 text-[10px] font-bold text-black">
                  {wishlist.length}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="rounded-full border border-white/10 bg-white/5 p-3 text-stone-200 transition hover:border-white/25 lg:hidden"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/10 bg-black/95 px-4 py-5 lg:hidden">
            <form
              onSubmit={handleSearch}
              className="mb-5 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3"
            >
              <Search size={16} className="text-stone-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-sm text-stone-100 outline-none placeholder:text-stone-500"
                placeholder="Search products"
              />
            </form>
            <div className="space-y-3">
              {user ? (
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm uppercase tracking-[0.24em] text-cyan-100">
                  Signed in as {customerName}
                </div>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm uppercase tracking-[0.28em] text-stone-200"
                >
                  Login / Sign Up
                </NavLink>
              )}
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm uppercase tracking-[0.28em] text-stone-200"
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink
                to="/track-order"
                onClick={() => setMobileOpen(false)}
                className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm uppercase tracking-[0.28em] text-stone-200"
              >
                Track Order
              </NavLink>
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm uppercase tracking-[0.28em] text-stone-200"
                >
                  Logout
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}

export default Navbar;
