'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

export default function AdminBankAccounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAccount, setEditAccount] = useState<any>(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const { data } = await adminApi.getBankAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load bank accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editAccount) {
        await adminApi.updateBankAccount(editAccount.id, formData);
      } else {
        await adminApi.createBankAccount(formData);
      }
      setShowForm(false);
      setEditAccount(null);
      resetForm();
      loadAccounts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save bank account');
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;

    try {
      await adminApi.deleteBankAccount(accountId);
      loadAccounts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete bank account');
    }
  };

  const handleEdit = (account: any) => {
    setEditAccount(account);
    setFormData({
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountHolder: account.accountHolder,
      isActive: account.isActive,
      sortOrder: account.sortOrder,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      isActive: true,
      sortOrder: 0,
    });
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bank Accounts</h1>
          <p className="mt-2 text-zinc-400">Manage bank accounts for manual transfers</p>
        </div>
        <button
          onClick={() => {
            setEditAccount(null);
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium hover:bg-purple-700"
        >
          <Plus size={18} />
          Add Bank Account
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                <th className="p-4">Bank</th>
                <th className="p-4">Account Number</th>
                <th className="p-4">Account Holder</th>
                <th className="p-4">Status</th>
                <th className="p-4">Sort Order</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400">
                    Loading...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400">
                    No bank accounts found
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-500/20 p-2">
                          <Building2 size={20} className="text-purple-400" />
                        </div>
                        <span className="font-medium">{account.bankName}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm">{account.accountNumber}</td>
                    <td className="p-4">{account.accountHolder}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          account.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-zinc-700 text-zinc-400'
                        }`}
                      >
                        {account.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400">{account.sortOrder}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(account)}
                          className="rounded p-1.5 hover:bg-zinc-700"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
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
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-xl font-bold">
              {editAccount ? 'Edit Bank Account' : 'Add Bank Account'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  required
                  placeholder="e.g., BCA, Mandiri, BNI"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  required
                  placeholder="1234567890"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Account Holder</label>
                <input
                  type="text"
                  value={formData.accountHolder}
                  onChange={(e) =>
                    setFormData({ ...formData, accountHolder: e.target.value })
                  }
                  required
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm text-zinc-400">
                  Active
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-purple-600 py-2 font-medium hover:bg-purple-700"
                >
                  {editAccount ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditAccount(null);
                    resetForm();
                  }}
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
