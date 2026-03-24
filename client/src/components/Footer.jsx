import { Instagram, Mail, MapPin, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contactDetails } from '../data/site';

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="section-shell grid gap-10 py-14 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-4">
          <p className="headline-font text-3xl font-semibold tracking-[0.2em] text-stone-100">MYCRAFT</p>
          <p className="max-w-sm text-sm leading-7 text-stone-400">
            Luxury fashion house for custom jewelry, wedding couture, modern tailoring, and elevated
            streetwear.
          </p>
        </div>
        <div className="space-y-3 text-sm text-stone-400">
          <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">Shop</p>
          <Link to="/traditional">Traditional Collection</Link>
          <Link to="/modern">Modern Fashion</Link>
          <Link to="/streetwear">Streetwear</Link>
          <Link to="/jewelry">Jewelry</Link>
        </div>
        <div className="space-y-3 text-sm text-stone-400">
          <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">Support</p>
          <Link to="/custom">Custom Orders</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/track-order">Order Tracking</Link>
          <Link to="/admin">Admin Dashboard</Link>
        </div>
        <div className="space-y-3 text-sm text-stone-400">
          <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">Contact</p>
          <div className="flex items-center gap-3">
            <PhoneCall size={15} className="text-amber-200" />
            <a href={`tel:${contactDetails.phoneRaw}`}>{contactDetails.phoneDisplay}</a>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={15} className="text-amber-200" />
            <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={15} className="text-amber-200" />
            <span>{contactDetails.location}</span>
          </div>
          <a href="https://instagram.com" className="inline-flex items-center gap-3">
            <Instagram size={15} className="text-amber-200" />
            <span>@mycraft.house</span>
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-[11px] uppercase tracking-[0.35em] text-stone-500">
        MyCraft 2026. Luxury fashion commerce experience.
      </div>
    </footer>
  );
}

export default Footer;
