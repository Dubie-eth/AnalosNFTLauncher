import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Launch On Los (LOL) - No-Code NFT Creation Platform',
  description: 'LOL your way to success! Create and launch NFT collections on Analos blockchain in under 5 minutes. No coding required.',
  keywords: ['NFT', 'Analos', 'Blockchain', 'Crypto', 'Digital Art', 'Generative Art', 'LOL', 'Launch On Los'],
  authors: [{ name: 'Launch On Los Team' }],
  creator: 'Launch On Los',
  publisher: 'Launch On Los',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'Launch On Los (LOL) - No-Code NFT Creation Platform',
    description: 'LOL your way to success! Create and launch NFT collections on Analos blockchain in under 5 minutes. No coding required.',
    siteName: 'Launch On Los',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Launch On Los (LOL)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Launch On Los (LOL) - No-Code NFT Creation Platform',
    description: 'LOL your way to success! Create and launch NFT collections on Analos blockchain in under 5 minutes. No coding required.',
    images: ['/og-image.png'],
    creator: '@launchonlos',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
