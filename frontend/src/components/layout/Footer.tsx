import Link from 'next/link';
import { Rocket, Twitter, Github, Discord, Mail } from 'lucide-react';

const navigation = {
  product: [
    { name: 'Create Collection', href: '/create' },
    { name: 'Explore Collections', href: '/explore' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Documentation', href: '/docs' },
  ],
  resources: [
    { name: 'Analos Explorer', href: 'https://explorer.analos.io', external: true },
    { name: 'Analos GitHub', href: 'https://github.com/AnalosFork', external: true },
    { name: 'Community', href: '/community' },
    { name: 'Support', href: '/support' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
  social: [
    {
      name: 'Twitter',
      href: 'https://twitter.com/analosnft',
      icon: Twitter,
    },
    {
      name: 'GitHub',
      href: 'https://github.com/analos-nft-launcher',
      icon: Github,
    },
    {
      name: 'Discord',
      href: 'https://discord.gg/analos',
      icon: Discord,
    },
    {
      name: 'Email',
      href: 'mailto:hello@analos-nft-launcher.com',
      icon: Mail,
    },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-analos-500 to-purple-600 flex items-center justify-center">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Analos NFT Launcher
              </span>
            </div>
            <p className="text-sm leading-6 text-gray-300">
              The easiest way to create and launch NFT collections on the Analos blockchain. 
              No coding required, maximum creativity unleashed.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Resources</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.resources.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                      >
                        {item.name}
                        {item.external && (
                          <span className="ml-1 text-xs text-gray-400">↗</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-xs leading-5 text-gray-400">
              &copy; {new Date().getFullYear()} Analos NFT Launcher. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>Powered by</span>
              <Link
                href="https://analos.io"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Analos Blockchain
              </Link>
              <span>•</span>
              <Link
                href="https://metaplex.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Metaplex
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
