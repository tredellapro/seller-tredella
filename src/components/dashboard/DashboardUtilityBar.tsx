import { HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';
import { HiChevronDown } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';

const SUPPORT_PHONE = '+92 300 1234567';
const SUPPORT_EMAIL = 'support@tredella.com';

/* The thin brand strip above the dashboard. Contact details are links so they
   are usable on a phone, not just readable. */
export default function DashboardUtilityBar() {
  return (
    <div className="w-full bg-primary text-white">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <a
            href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}
            className="flex items-center gap-2 text-12 transition-opacity hover:opacity-80"
          >
            <HiOutlinePhone className="text-15" aria-hidden="true" />
            {SUPPORT_PHONE}
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center gap-2 text-12 transition-opacity hover:opacity-80"
          >
            <HiOutlineMail className="text-15" aria-hidden="true" />
            {SUPPORT_EMAIL}
          </a>
        </div>

        <div className="flex items-center gap-4">
          {/* one language for now — the control is here for when there are more */}
          <button
            type="button"
            className="flex items-center gap-1.5 text-12 transition-opacity hover:opacity-80"
          >
            EN
            <HiChevronDown className="text-14" aria-hidden="true" />
          </button>

          <a
            href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat with support on WhatsApp"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <FaWhatsapp className="text-18" />
          </a>

          <span className="text-12 font-medium">Need Help?</span>
        </div>
      </div>
    </div>
  );
}
