'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    router.push(token ? '/chat' : '/login');
  }, [router]);
  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="text-4xl mb-4">🛒</div>
        <p className="text-gray-400">Loading TechMart AI Support...</p>
      </div>
    </div>
  );
}
