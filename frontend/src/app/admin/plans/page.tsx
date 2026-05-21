'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';

export default function AdminPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPlan, setEditPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    durationMonths: 1,
    price: 0,
    features: [] as string[],
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data } = await adminApi.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editPlan) {
        await adminApi.updatePlan(editPlan.id, formData);
      } else {
        await adminApi.createPlan(formData);
      }
      setShowForm(false);
      setEditPlan(null);
      resetForm();
      loadPlans();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      await adminApi.deletePlan(planId);
      loadPlans();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete plan');
    }
  };

  const handleEdit = (plan: any) => {
    setEditPlan(plan);
    setFormData({
      name: plan.name,
      durationMonths: plan.durationMonths,
      price: plan.price,
      features: plan.features || [],
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      durationMonths: 1,
      price: 0,
      features: [],
      isActive: true,
      sortOrder: 0,
    });
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="mt-2 text-zinc-400">Manage subscription plans and pricing</p>
        </div>
        <button
          onClick={() => {
            setEditPlan(null);
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium hover:bg-purple-700"
        >
          <Plus size={18} />
          Add Plan
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full p-8 text-center text-zinc-400">Loading...</div>
        ) : plans.length === 0 ? (
          <div className="col-span-full p-8 text-center text-zinc-400">No plans found</div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-zinc-400">{plan.durationMonths} months</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="rounded p-1.5 hover:bg-zinc-800"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="rounded p-1.5 hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-3xl font-bold">
                  Rp {plan.price.toLocaleString('id-ID')}
                </div>
                <div className="text-sm text-zinc-400">per {plan.durationMonths} months</div>
              </div>

              <div className="mb-4 space-y-2">
                {plan.features?.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    plan.isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-sm text-zinc-400">
                  {plan._count.subscriptions} subscriptions
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-xl font-bold">
              {editPlan ? 'Edit Plan' : 'Add New Plan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Plan Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Duration (months)</label>
                <input
                  type="number"
                  value={formData.durationMonths}
                  onChange={(e) =>
                    setFormData({ ...formData, durationMonths: parseInt(e.target.value) })
                  }
                  required
                  min="1"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Price (IDR)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseInt(e.target.value) })
                  }
                  required
                  min="1000"
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
                  {editPlan ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditPlan(null);
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
