'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Rocket, ArrowRight, Sparkles, Zap } from 'lucide-react';

export function CTA() {
  return (
    <div className="bg-gray-900">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to launch your NFT collection?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Join thousands of creators who have already launched their collections on Analos. 
              Start your journey today and bring your vision to life.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/create"
              className="group relative inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-analos-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Create Your Collection
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link
              href="/explore"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-900 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
            >
              Explore Collections
            </Link>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-analos-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Quick Setup</h3>
              <p className="mt-2 text-sm text-gray-300">
                Get started in minutes with our intuitive interface
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">AI-Powered</h3>
              <p className="mt-2 text-sm text-gray-300">
                Generate unique combinations with our smart algorithms
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Analos Native</h3>
              <p className="mt-2 text-sm text-gray-300">
                Built specifically for the Analos blockchain ecosystem
              </p>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 border-t border-gray-800 pt-8"
          >
            <p className="text-sm text-gray-400">
              Trusted by 1,000+ creators • 10,000+ NFTs launched • 99.9% uptime
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
