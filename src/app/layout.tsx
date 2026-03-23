import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap', weight: ['400', '500', '600', '700'] });
const jetbrainsMono = JetBrains_Mono({ variable: '--font-geist-mono', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'ChinaCars.Global — Chinese Car Brands Platform',
    template: '%s | ChinaCars.Global',
  },
  description:
    'The global platform for Chinese automotive brands — compare specs, prices and availability',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${dmSans.className} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
