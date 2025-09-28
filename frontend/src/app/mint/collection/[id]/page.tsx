'use client';

import { useParams } from 'next/navigation';

export default function CollectionMintPage() {
  const params = useParams();
  const collectionId = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🚀 Collection Mint Page
        </h1>
        <p className="text-gray-300 text-lg mb-4">
          Collection ID: <span className="font-mono text-blue-400">{collectionId}</span>
        </p>
        <p className="text-gray-300 text-sm">
          Dynamic routing is working! 🎉
        </p>
      </div>
    </div>
  );
}
