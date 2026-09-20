import { ReactNode } from 'react';
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';

/** Public marketing pages keep the site header and footer. */
export default function MarketingLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
