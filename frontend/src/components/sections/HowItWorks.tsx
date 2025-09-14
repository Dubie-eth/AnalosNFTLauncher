'use client';

import { motion } from 'framer-motion';
import { Upload, Settings, Rocket, BarChart3 } from 'lucide-react';

const steps = [
  {
    id: 1,
    name: 'Upload & Configure',
    description: 'Upload your trait layers, set rarity weights, and configure collection details.',
    icon: Upload,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    id: 2,
    name: 'Generate & Preview',
    description: 'Our AI generates unique combinations and you can preview your collection.',
    icon: Settings,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    id: 3,
    name: 'Deploy & Launch',
    description: 'Deploy to Analos blockchain and launch your collection in minutes.',
    icon: Rocket,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    id: 4,
    name: 'Manage & Track',
    description: 'Monitor mint progress, manage whitelists, and track analytics.',
    icon: BarChart3,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
];

export function HowItWorks() {
  return (
    <div className="py-24 sm:py-32 bg-gray-50">
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
            How it works
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Launch in 4 simple steps
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            From concept to launch, our streamlined process makes NFT creation accessible to everyone.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {steps.map((step, stepIdx) => (
              <motion.div
                key={step.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: stepIdx * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Connector Line */}
                {stepIdx < steps.length - 1 && (
                  <div className="absolute top-12 left-12 hidden lg:block">
                    <div className="h-0.5 w-full bg-gray-300" />
                  </div>
                )}

                <div className="relative">
                  {/* Step Number */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-analos-200 text-sm font-semibold text-analos-600">
                    {step.id}
                  </div>

                  {/* Step Content */}
                  <div className="mt-6">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${step.bgColor}`}>
                      <step.icon className={`h-6 w-6 ${step.color}`} aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">
                      {step.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timeline for mobile */}
        <div className="mt-16 lg:hidden">
          <div className="flow-root">
            <div className="-mb-8">
              {steps.map((step, stepIdx) => (
                <motion.div
                  key={step.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: stepIdx * 0.1 }}
                  viewport={{ once: true }}
                  className="relative pb-8"
                >
                  {stepIdx !== steps.length - 1 ? (
                    <div
                      className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-analos-200">
                      <step.icon className={`h-4 w-4 ${step.color}`} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {step.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
