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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-black rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Hello, {user.username}!</h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => router.push('/courses')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-2xl transition transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-4">🧭</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">CourseCompass</h2>
            <p className="text-gray-600">Browse courses, read professor reviews, and find the perfect class for you.</p>
            <div className="mt-4 text-blue-600 font-medium">Explore Courses →</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 opacity-50">
            <div className="text-5xl mb-4">💼</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Career Hub</h2>
            <p className="text-gray-600">Coming soon: Job postings, internships, and career resources.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 opacity-50">
            <div className="text-5xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Social Feed</h2>
            <p className="text-gray-600">Coming soon: Connect with classmates and share updates.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 opacity-50">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Study Groups</h2>
            <p className="text-gray-600">Coming soon: Find study partners and join study groups.</p>
          </div>
        </div>
      </div>
    </div>
  );
}