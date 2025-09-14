'use client';

import { motion } from 'framer-motion';
import { 
  Zap, 
  Palette, 
  Shield, 
  BarChart3, 
  Users, 
  Globe,
  Lock,
  Sparkles,
  Rocket,
  Layers
} from 'lucide-react';

const features = [
  {
    name: 'No-Code Creation',
    description: 'Create sophisticated NFT collections without writing a single line of code. Our intuitive interface handles all the complexity.',
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  {
    name: 'Generative Art Engine',
    description: 'Upload trait layers and let our AI generate thousands of unique combinations with custom rarity rules.',
    icon: Palette,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    name: 'Analos Native',
    description: 'Built specifically for Analos blockchain with native RPC integration and optimized for low fees.',
    icon: Globe,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    name: 'Instant Deployment',
    description: 'Deploy your collection to Analos mainnet in under 5 minutes with automatic explorer verification.',
    icon: Rocket,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    name: 'Advanced Analytics',
    description: 'Track mint progress, rarity distribution, and collection performance with detailed analytics dashboard.',
    icon: BarChart3,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
  },
  {
    name: 'Community Tools',
    description: 'Built-in whitelist management, airdrop tools, and community engagement features.',
    icon: Users,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
  },
  {
    name: 'Secure & Reliable',
    description: 'Enterprise-grade security with multi-signature support and battle-tested smart contracts.',
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  {
    name: 'Layer Management',
    description: 'Organize traits into layers with drag-and-drop interface and real-time preview generation.',
    icon: Layers,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  {
    name: 'Royalty Management',
    description: 'Set custom royalty percentages and manage creator earnings with transparent fee structures.',
    icon: Lock,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export function Features() {
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
            Everything you need
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Powerful features for creators
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            From concept to launch, our platform provides all the tools you need to create 
            successful NFT collections on Analos blockchain.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                variants={itemVariants}
                className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-analos-200"
              >
                <div className="flex items-start">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} aria-hidden="true" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-analos-600 transition-colors">
                      {feature.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-analos-50 to-purple-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="rounded-2xl bg-gradient-to-r from-analos-600 to-purple-600 px-8 py-12 text-white">
            <Sparkles className="mx-auto h-12 w-12 text-white/80" />
            <h3 className="mt-4 text-2xl font-bold">
              Ready to launch your collection?
            </h3>
            <p className="mt-2 text-lg text-white/90">
              Join thousands of creators who have already launched their NFTs on Analos.
            </p>
            <div className="mt-6">
              <a
                href="/create"
                className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-analos-600 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl"
              >
                Get Started Now
                <Rocket className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
