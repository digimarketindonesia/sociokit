'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/services/api';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    fullName: '',
    referralCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setFormData((prev) => ({ ...prev, referralCode: ref }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.register(formData);
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Registrasi gagal. Coba lagi.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-2xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side - Form */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
              <p className="text-gray-400 text-sm">Enter your information to create a new account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Mulyono Sutrisno"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="mulyonost@example.com"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="mulyonost"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                  minLength={6}
                />
              </div>

              {formData.referralCode && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Referral Code
                  </label>
                  <input
                    type="text"
                    value={formData.referralCode}
                    onChange={(e) =>
                      setFormData({ ...formData, referralCode: e.target.value })
                    }
                    placeholder="AFFILIATE123"
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link
                  href="/sign-in"
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Right Side - Pricing */}
          <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-2">SocioFeed</h2>
            <p className="text-gray-400 text-sm mb-6">Social media marketing</p>

            <div className="mb-6">
              <div className="text-4xl font-bold text-white mb-2">
                Rp <span className="text-5xl">90.000</span>
              </div>
              <p className="text-gray-400 text-sm">One-time payment • Lifetime access</p>
            </div>

            <ul className="space-y-3">
              {[
                'Multi-Image Collage Builder',
                'Direct Publish to Page',
                '7 Layout Templates',
                'Auto Token Generate',
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
