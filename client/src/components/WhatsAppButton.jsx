import { MessageCircleMore } from 'lucide-react';
import { contactDetails } from '../data/site';

function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${contactDetails.phoneIntl}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,211,102,0.35)] transition hover:scale-[1.03]"
    >
      <MessageCircleMore size={18} />
      WhatsApp
    </a>
  );
}

export default WhatsAppButton;
