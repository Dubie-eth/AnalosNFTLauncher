'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';

const stats = [
  {
    name: 'Collections Launched',
    value: '1,234',
    change: '+12%',
    changeType: 'positive',
  },
  {
    name: 'Total NFTs Minted',
    value: '45,678',
    change: '+23%',
    changeType: 'positive',
  },
  {
    name: 'Active Creators',
    value: '567',
    change: '+8%',
    changeType: 'positive',
  },
  {
    name: 'Average Deploy Time',
    value: '4.2min',
    change: '-15%',
    changeType: 'positive',
  },
];

function AnimatedCounter({ value, duration = 2000 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (!inView) return;

    const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
    const isDecimal = value.includes('.');
    const decimalPlaces = isDecimal ? value.split('.')[1]?.length || 0 : 0;
    
    const startTime = Date.now();
    const startValue = 0;
    const endValue = numericValue;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      
      setCount(parseFloat(currentValue.toFixed(decimalPlaces)));
      
      if (progress >= 1) {
        clearInterval(timer);
        setCount(endValue);
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [inView, value, duration]);

  const formatValue = (val: number) => {
    if (value.includes('K')) {
      return (val / 1000).toFixed(1) + 'K';
    }
    if (value.includes('M')) {
      return (val / 1000000).toFixed(1) + 'M';
    }
    if (value.includes('min')) {
      return val.toFixed(1) + 'min';
    }
    return Math.round(val).toLocaleString();
  };

  return (
    <span ref={ref} className="text-4xl font-bold text-gray-900 sm:text-5xl">
      {formatValue(count)}
    </span>
  );
}

export function Stats() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-base font-semibold leading-7 text-analos-600"
          >
            Trusted by creators worldwide
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            Platform statistics
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-6 text-lg leading-8 text-gray-600"
          >
            Join thousands of creators who have successfully launched their NFT collections
            using our platform.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-2xl bg-white px-8 py-10 shadow-sm ring-1 ring-gray-200"
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <dt className="text-sm font-medium leading-6 text-gray-600">
                      {stat.name}
                    </dt>
                    <dd className="mt-2 flex items-baseline">
                      <AnimatedCounter value={stat.value} />
                      <span
                        className={`ml-2 text-sm font-semibold ${
                          stat.changeType === 'positive'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </span>
                    </dd>
                  </div>
                </div>
                
                {/* Background decoration */}
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-analos-100 to-purple-100 opacity-50" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="rounded-2xl bg-gradient-to-r from-analos-50 to-purple-50 px-8 py-12">
            <h3 className="text-2xl font-bold text-gray-900">
              Ready to join our community?
            </h3>
            <p className="mt-2 text-lg text-gray-600">
              Start creating your NFT collection today and become part of the Analos ecosystem.
            </p>
            <div className="mt-6">
              <a
                href="/create"
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-analos-600 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              >
                Get Started Free
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
