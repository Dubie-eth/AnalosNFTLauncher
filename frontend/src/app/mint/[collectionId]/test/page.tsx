'use client';

import { useParams } from 'next/navigation';

export default function TestPage() {
  const params = useParams();
  const collectionId = params.collectionId as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Test Dynamic Route
        </h1>
        <p className="text-gray-300 text-lg">
          Collection ID: <span className="font-mono text-blue-400">{collectionId}</span>
        </p>
        <p className="text-gray-300 text-sm mt-4">
          If you can see this, the dynamic route is working!
        </p>
      </div>
    </div>
  );
}
