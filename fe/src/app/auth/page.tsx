'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [emailWarning, setEmailWarning] = useState('');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !formData.email.endsWith('@sdsu.edu')) {
      setError('Email must be from @sdsu.edu domain');
      return;
    }

    try {
      const endpoint = isLogin ? '/login' : '/users/';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail);
      }

      if (isLogin) {
        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data));
        router.push('/');
      } else {
        setToast({message: 'Registration successful! Please login.', type: 'success'});
        setTimeout(() => {
          setIsLogin(true);
          setFormData({ email: '', username: '', password: '' });
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 to-neutral-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6" style={{color: '#A6192E'}}>
          {isLogin ? 'LOGIN' : 'REGISTER'}
        </h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isLogin ? 'Email or Username' : 'Email'}</label>
            <input
              type={isLogin ? "text" : "email"}
              required
              pattern={isLogin ? undefined : ".*@sdsu\\.edu$"}
              placeholder={isLogin ? "Email or Username" : "yourname@sdsu.edu"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-black"
              style={{outlineColor: '#A6192E'}}
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setEmailWarning('');
              }}
              onBlur={(e) => {
                if (!isLogin && e.target.value && !e.target.value.endsWith('@sdsu.edu')) {
                  setEmailWarning('Email must be from @sdsu.edu domain');
                }
              }}
            />
            {emailWarning && (
              <p className="text-sm mt-1" style={{color: '#A6192E'}}>{emailWarning}</p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                required
                placeholder="Enter username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-black"
                style={{outlineColor: '#A6192E'}}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-black"
              style={{outlineColor: '#A6192E'}}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full text-white py-2 rounded-lg transition font-medium"
            style={{backgroundColor: '#A6192E'}}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8B1528'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A6192E'}
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ email: '', username: '', password: '' });
            }}
            className="hover:underline font-medium"
            style={{color: '#A6192E'}}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}