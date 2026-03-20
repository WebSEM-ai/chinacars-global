import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ variable: '--font-sans', subsets: ['latin'], display: 'swap' });
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
