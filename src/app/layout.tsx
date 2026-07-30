import './globals.css';
import { Poppins } from 'next/font/google';
import Customprovider from '../redux/CustomProvider';
import { createMetadata } from 'utils/metadataHelper';
import { pageMetadataData } from 'data/meta-data';
export const metadata = createMetadata(pageMetadataData.HomePage);

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-Poppins',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <Customprovider>{children}</Customprovider>
      </body>
    </html>
  );
}
