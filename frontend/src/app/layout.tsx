import './globals.css';
import dynamic from 'next/dynamic';

// Dynamically import WalletProvider to avoid hydration issues
const WalletContextProvider = dynamic(
  () => import('./components/WalletProvider').then((mod) => ({ default: mod.WalletContextProvider })),
  { ssr: false }
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Launch On Los - NFT Platform for Analos</title>
        <meta name="description" content="Launch your NFT collections on Analos blockchain with ease. Upload existing Solana collections or create new ones." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>" />
      </head>
      <body>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}