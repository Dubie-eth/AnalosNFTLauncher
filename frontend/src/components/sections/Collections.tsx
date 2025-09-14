'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ExternalLink, Users, Zap, TrendingUp } from 'lucide-react';

// Mock data for featured collections
const featuredCollections = [
  {
    id: '1',
    name: 'Analos Apes',
    description: 'Unique digital apes living on the Analos blockchain',
    image: '/api/placeholder/300/300',
    creator: '0x1234...5678',
    minted: 2341,
    total: 10000,
    floorPrice: 0.5,
    volume: 1250.5,
    verified: true,
  },
  {
    id: '2',
    name: 'Cosmic Warriors',
    description: 'Epic warriors from distant galaxies',
    image: '/api/placeholder/300/300',
    creator: '0x9876...5432',
    minted: 5678,
    total: 8888,
    floorPrice: 0.8,
    volume: 3200.2,
    verified: false,
  },
  {
    id: '3',
    name: 'Pixel Dreams',
    description: 'Retro pixel art collection with modern twist',
    image: '/api/placeholder/300/300',
    creator: '0x4567...8901',
    minted: 1234,
    total: 5000,
    floorPrice: 0.3,
    volume: 890.7,
    verified: true,
  },
];

export function Collections() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-analos-600">
            Featured Collections
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Discover amazing NFTs
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Explore collections created by our community and get inspired for your own project.
          </p>
        </motion.div>

        {/* Collections Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3"
        >
          {featuredCollections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:shadow-lg hover:ring-analos-200"
            >
              {/* Collection Image */}
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Verified Badge */}
                {collection.verified && (
                  <div className="absolute top-4 right-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Collection Info */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-analos-600 transition-colors">
                    {collection.name}
                  </h3>
                  <Link
                    href={`/collection/${collection.id}`}
                    className="text-gray-400 hover:text-analos-600 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
                
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {collection.description}
                </p>

                {/* Creator */}
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Users className="mr-2 h-4 w-4" />
                  <span>by {collection.creator}</span>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Minted</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {collection.minted.toLocaleString()} / {collection.total.toLocaleString()}
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-analos-500 to-purple-500"
                        style={{
                          width: `${(collection.minted / collection.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Floor Price</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {collection.floorPrice} ANALOS
                    </div>
                  </div>
                </div>

                {/* Volume */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <TrendingUp className="mr-1 h-4 w-4" />
                    <span>Volume</span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {collection.volume.toLocaleString()} ANALOS
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  <Link
                    href={`/collection/${collection.id}`}
                    className="block w-full rounded-lg bg-gradient-to-r from-analos-600 to-purple-600 px-4 py-2 text-center text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                  >
                    View Collection
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/explore"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
          >
            View All Collections
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
