'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Globe,
  Building2,
  Package,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/plans', label: 'Plans', icon: Package },
  { href: '/admin/domains', label: 'Domains', icon: Globe },
  { href: '/admin/bank-accounts', label: 'Bank Accounts', icon: Building2 },
  { href: '/admin/affiliates', label: 'Affiliates', icon: Wallet },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/sign-in');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    setUser(userData);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/sign-in');
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } border-r border-zinc-800 bg-zinc-900 transition-all duration-200 flex flex-col`}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-gradient-to-br from-purple-500 to-pink-500" />
              <span className="font-semibold">Admin Panel</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded p-1.5 hover:bg-zinc-800"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 p-3">
          {sidebarOpen && (
            <div className="mb-3 px-3">
              <div className="text-sm font-medium">{user.fullName}</div>
              <div className="text-xs text-zinc-500">{user.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
