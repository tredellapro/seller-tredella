import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaXTwitter, FaTiktok } from 'react-icons/fa6';
import {
  footerColumns,
  contactDetails,
  companyAddress,
  socialLinks
} from 'data/data';
import FooterLinkColumn from 'components/ui/FooterLinkColumn';

const socialIcons: Record<string, React.ReactNode> = {
  Facebook: <FaFacebookF />,
  Instagram: <FaInstagram />,
  X: <FaXTwitter />,
  TikTok: <FaTiktok />
};



export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="container py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-8">
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/assets/images/logo.webp"
                alt="Tredella"
                width={140}
                height={45}
                className="h-9 w-auto"
              />
            </Link>
            <p className="mt-5 max-w-xs text-13 text-gray sm:text-14">
              Tredella is your trusted platform for seamless retail and
              wholesale operations.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex_center h-9 w-9 rounded-full bg-primary text-14 text-white transition-opacity duration-200 hover:opacity-90"
                >
                  {socialIcons[social.label]}
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <FooterLinkColumn key={column.title} {...column} />
          ))}

          <div>
            <h3 className="text-17 font-semibold text-secondary sm:text-19">
              Contact Us
            </h3>
            <ul className="mt-5 space-y-3">
              {contactDetails.map((detail) => (
                <li key={detail.label}>
                  <a
                    href={detail.href}
                    className="text-13 text-gray transition-colors duration-200 hover:text-primary sm:text-14"
                  >
                    {detail.label}
                  </a>
                </li>
              ))}
              <li className="max-w-[220px] pt-2 text-13 text-gray sm:text-14">
                {companyAddress}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-secondary/10 pt-8">
          <p className="text-13 text-secondary sm:text-14">
            Copyright ©2024 - 2025. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
