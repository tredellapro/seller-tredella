import Link from 'next/link';
import { FooterColumn } from 'data/data';

interface FooterLinkColumnProps extends FooterColumn {
  className?: string;
}

export default function FooterLinkColumn({
  title,
  links,
  className = ''
}: FooterLinkColumnProps) {
  return (
    <div className={className}>
      <h3 className="text-17 font-semibold text-secondary sm:text-19">
        {title}
      </h3>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-13 text-gray transition-colors duration-200 hover:text-primary sm:text-14"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
