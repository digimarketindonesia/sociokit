export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Subscription & Billing</h2>
        <p className="text-gray-400">
          Choose a plan and manage your subscription.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {[
          { name: '1 Bulan', price: 50000, duration: 1 },
          { name: '3 Bulan', price: 120000, duration: 3, save: 30000 },
          { name: '6 Bulan', price: 200000, duration: 6, save: 100000 },
          { name: '1 Tahun', price: 350000, duration: 12, save: 250000 },
        ].map((plan) => (
          <div
            key={plan.name}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition"
          >
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold mb-4">
              Rp {plan.price.toLocaleString('id-ID')}
            </div>
            {plan.save && (
              <div className="text-sm text-green-400 mb-4">
                Hemat Rp {plan.save.toLocaleString('id-ID')}
              </div>
            )}
            <ul className="space-y-2 mb-6 text-sm text-gray-400">
              <li>✓ Akses semua tools</li>
              <li>✓ Auto Post Group & Fanpage</li>
              <li>✓ Shortlink Unlimited</li>
              <li>✓ Share to Story</li>
            </ul>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
