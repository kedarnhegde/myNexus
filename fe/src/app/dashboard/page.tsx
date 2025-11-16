'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/auth');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-md">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-black rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold">
            {user.username[0].toUpperCase()}
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Hello, {user.username}!
        </h1>
        
        <p className="text-gray-600 mb-6">{user.email}</p>
        
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
}