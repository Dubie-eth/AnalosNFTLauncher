'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowRight, Zap, Shield, Rocket, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Zap,
    text: 'Deploy in under 5 minutes',
    color: 'text-yellow-500',
  },
  {
    icon: Shield,
    text: 'No coding required',
    color: 'text-green-500',
  },
  {
    icon: Rocket,
    text: 'Analos blockchain native',
    color: 'text-blue-500',
  },
];

export function Hero() {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-analos-50 via-white to-purple-50" />
      <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] bg-center bg-no-repeat bg-cover opacity-5" />
      
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center rounded-full bg-analos-100 px-4 py-2 text-sm font-medium text-analos-800 ring-1 ring-inset ring-analos-200">
              <Sparkles className="mr-2 h-4 w-4" />
              Powered by Analos Blockchain
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
          >
            Launch On Los
            <span className="block gradient-text">LOL Your Way to Success</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-gray-600"
          >
            LOL your way to success! Create, deploy, and manage NFT collections on Analos blockchain without writing a single line of code. 
            From generative art to utility NFTs, we've got you covered with Launch On Los.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6"
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
                <span className="text-sm font-medium text-gray-700">
                  {feature.text}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/create"
              className="group relative inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-analos-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Create Collection
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link
              href="/explore"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-900 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
            >
              Explore Collections
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-analos-600">10K+</div>
              <div className="text-sm text-gray-600">Max Collection Size</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-analos-600">2.5%</div>
              <div className="text-sm text-gray-600">Platform Fee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-analos-600">5min</div>
              <div className="text-sm text-gray-600">Average Deploy Time</div>
            </div>
          </motion.div>
        </div>

        {/* Hero Image/Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 flex justify-center"
        >
          <div className="relative">
            {/* NFT Preview Grid */}
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                  className="h-24 w-24 rounded-lg bg-gradient-to-br from-analos-100 to-purple-100 border-2 border-white shadow-lg"
                >
                  <div className="h-full w-full rounded-lg bg-gradient-to-br from-analos-200 to-purple-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">#{i + 1}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-yellow-400 shadow-lg"
            />
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 h-6 w-6 rounded-full bg-green-400 shadow-lg"
            />
            <motion.div
              animate={{ y: [-5, 15, -5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 -left-8 h-4 w-4 rounded-full bg-blue-400 shadow-lg"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
