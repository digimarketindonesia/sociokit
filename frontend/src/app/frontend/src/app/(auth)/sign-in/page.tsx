'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/services/api';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(formData);
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'ADMIN') {
        router.push('/admin/users');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Login gagal. Periksa kredensial Anda.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">ST</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400">Login to your SocioFeed account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                value={formData.emailOrUsername}
                onChange={(e) =>
                  setFormData({ ...formData, emailOrUsername: e.target.value })
                }
                placeholder="mulyonost atau mulyonost@gmail.com"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/sign-up"
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Social Icons (decorative) */}
        <div className="mt-8 flex justify-center gap-8">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">f</span>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">i</span>
          </div>
          <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">t</span>
          </div>
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">@</span>
          </div>
        </div>
      </div>
    </div>
  );
}
