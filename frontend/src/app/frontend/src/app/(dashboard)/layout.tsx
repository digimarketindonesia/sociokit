'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/sign-in');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/sign-in');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'FB Accounts', path: '/fb-accounts', icon: '👤' },
    { name: 'FP Card Content', path: '/fp-card', icon: '🎨' },
    { name: 'Carousel to Link', path: '/carousel', icon: '🖼️' },
    { name: 'Auto Post Group', path: '/auto-post', icon: '📤' },
    { name: 'Shortlink', path: '/shortlink', icon: '🔗' },
    { name: 'Affiliate', path: '/affiliate', icon: '💰' },
    { name: 'Billing', path: '/billing', icon: '💳' },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">ST</span>
            </div>
            {sidebarOpen && (
              <div>
                <div className="font-bold text-sm">SocioFeed</div>
                <div className="text-xs text-gray-400">User Panel</div>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600"
        >
          <span className="text-xs">{sidebarOpen ? '◀' : '▶'}</span>
        </button>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">
                {user?.fullName?.charAt(0) || 'U'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.fullName}</div>
                <div className="text-xs text-gray-400 truncate">{user?.email}</div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="mt-3 w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Header */}
        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold">
              {menuItems.find((item) => item.path === pathname)?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-700 rounded-lg">
              <span className="text-xl">🔔</span>
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg">
              <span className="text-xl">⚙️</span>
            </button>
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
            >
              Landing Page
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
