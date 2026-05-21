'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import { Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editUser, setEditUser] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getUsers({ search, page, limit: 20 });
      setUsers(data.data);
      setTotal(data.meta.total);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await adminApi.deleteUser(userId);
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      await adminApi.updateUser(editUser.id, {
        fullName: editUser.fullName,
        email: editUser.email,
        role: editUser.role,
      });
      setEditUser(null);
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="mt-2 text-zinc-400">Manage all users in the system</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search by email, username, or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Verified</th>
                <th className="p-4">Referrals</th>
                <th className="p-4">Subscriptions</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-400">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-zinc-400">{user.email}</div>
                        <div className="text-xs text-zinc-500">@{user.username}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.emailVerified ? (
                        <UserCheck size={18} className="text-green-500" />
                      ) : (
                        <UserX size={18} className="text-zinc-500" />
                      )}
                    </td>
                    <td className="p-4 text-zinc-400">{user._count.referrals}</td>
                    <td className="p-4 text-zinc-400">{user._count.subscriptions}</td>
                    <td className="p-4 text-sm text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditUser(user)}
                          className="rounded p-1.5 hover:bg-zinc-700"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="rounded p-1.5 hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="flex items-center justify-between border-t border-zinc-800 p-4">
            <div className="text-sm text-zinc-400">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="rounded px-3 py-1 text-sm hover:bg-zinc-800 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 20 >= total}
                className="rounded px-3 py-1 text-sm hover:bg-zinc-800 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-xl font-bold">Edit User</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Full Name</label>
                <input
                  type="text"
                  value={editUser.fullName}
                  onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 focus:border-purple-500 focus:outline-none"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-purple-600 py-2 font-medium hover:bg-purple-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="flex-1 rounded-lg border border-zinc-800 py-2 font-medium hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
