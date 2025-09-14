import { Hero } from '@/components/sections/Hero';
import { Features } from '@/components/sections/Features';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Stats } from '@/components/sections/Stats';
import { Collections } from '@/components/sections/Collections';
import { CTA } from '@/components/sections/CTA';
import NFTGenerator from '@/components/nft-generator/NFTGenerator';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-analos-50 via-white to-purple-50">
      <Header />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Try the LOL NFT Generator</h2>
              <p className="text-xl text-gray-600">Create your first generative NFT collection in minutes</p>
            </div>
            <NFTGenerator />
          </div>
        </div>
        <Collections />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
