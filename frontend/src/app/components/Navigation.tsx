'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '15px 0',
      marginBottom: '20px'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{
          color: 'white',
          textDecoration: 'none',
          fontSize: '1.5rem',
          fontWeight: '700',
          background: 'linear-gradient(45deg, #fff, #f0f8ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🚀 Launch On Los
        </Link>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/" style={{
            color: 'white',
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            background: 'rgba(255, 255, 255, 0.1)'
          }}>
            Home
          </Link>
          <Link href="/preview" style={{
            color: 'white',
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            background: 'rgba(255, 255, 255, 0.1)'
          }}>
            Preview
          </Link>
        </div>
      </div>
    </nav>
  );
}
