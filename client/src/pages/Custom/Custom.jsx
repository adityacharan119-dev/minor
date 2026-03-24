import { useEffect, useState } from 'react';
import { CheckCircle2, ImagePlus, Send } from 'lucide-react';
import { submitCustomRequest } from '../../lib/api';
import SectionTitle from '../../components/SectionTitle';
import { useAuth } from '../../context/AuthContext';

const initialState = {
  name: '',
  email: '',
  phone: '',
  productType: 'Jewelry',
  size: '',
  color: '',
  description: '',
};

function Custom() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialState);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      name: previous.name || user.name,
      email: previous.email || user.email,
      phone: previous.phone || user.phone,
    }));
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (file) {
      payload.append('inspirationImage', file);
    }

    try {
      const response = await submitCustomRequest(payload);
      setStatus({
        type: 'success',
        message: `Request received. Reference ${response.request.reference} has been created. The admin will review fabric, fit, and finishing before sharing the budget.`,
      });
      setForm({
        ...initialState,
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });
      setFile(null);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Unable to submit your request.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-shell py-10">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="luxury-panel rounded-[32px] border border-white/10 p-8">
          <SectionTitle
            eyebrow="Custom Design Studio"
            title="Request one-of-one jewelry, dresses, hoodies, and tees."
            description="Upload inspiration, define sizing and palette, and share your design direction. The admin decides the final budget after reviewing cloth, fitting, and finishing."
          />
          <div className="mt-8 space-y-5 text-sm text-stone-400">
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
              Jewelry sketches, bridal dressing, oversized tees, and custom-name hoodies supported.
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
              The Hyderabad admin team follows up within 24 to 48 hours with pricing and production lead times.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="luxury-panel rounded-[32px] border border-white/10 p-8">
          {user ? (
            <div className="mb-6 rounded-[22px] border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
              Signed in as {user.name}. Your customer profile is being used for this request.
            </div>
          ) : null}
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-stone-400">Name</span>
              <input required name="name" value={form.name} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-stone-400">Email</span>
              <input required type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-stone-400">Phone</span>
              <input required name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-stone-400">Product Type</span>
              <select name="productType" value={form.productType} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40">
                <option>Jewelry</option>
                <option>Dresses</option>
                <option>Hoodies</option>
                <option>T-shirts</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm text-stone-400">Size Selection</span>
              <input name="size" value={form.size} onChange={handleChange} placeholder="L / Ring 7 / Custom" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-stone-400">Color Selection</span>
              <input name="color" value={form.color} onChange={handleChange} placeholder="Gold / Ivory / Onyx" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm text-stone-400">Description</span>
              <textarea required name="description" value={form.description} onChange={handleChange} rows="5" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-200/40" />
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm text-stone-400">Upload Inspiration Image</span>
              <div className="rounded-[26px] border border-dashed border-white/15 bg-white/5 p-6">
                <div className="flex flex-col items-center justify-center gap-3 text-center text-stone-400">
                  <ImagePlus size={28} className="text-amber-200" />
                  <p>{file ? file.name : 'PNG, JPG, WEBP accepted for custom inspirations.'}</p>
                  <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} className="block w-full text-sm text-stone-400 file:mr-4 file:rounded-full file:border-0 file:bg-amber-200 file:px-4 file:py-2 file:font-semibold file:text-black" />
                </div>
              </div>
            </label>
          </div>

          {status.message ? (
            <div className={`mt-6 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${status.type === 'success' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-red-400/30 bg-red-400/10 text-red-200'}`}>
              {status.type === 'success' ? <CheckCircle2 size={18} /> : null}
              {status.message}
            </div>
          ) : null}

          <button type="submit" disabled={submitting} className="mt-6 inline-flex items-center gap-3 rounded-full bg-amber-200 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60">
            <Send size={16} />
            {submitting ? 'Submitting' : 'Submit Design Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Custom;
