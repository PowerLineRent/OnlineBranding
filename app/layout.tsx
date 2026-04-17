import type { Metadata } from 'next';
import './globals.css';
import ScrollToTopButton from '@/components/ScrollToTopButton';

export const metadata: Metadata = {
  title: {
    template: '%s | PLREI Brand Guidelines',
    default: 'PLREI Brand Guidelines',
  },
  description: 'Official branding guidelines for Power Line Rent-E-Quip, Inc.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ScrollToTopButton />
      </body>
    </html>
  );
}
