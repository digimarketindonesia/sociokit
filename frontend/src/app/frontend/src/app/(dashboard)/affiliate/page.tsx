export default function AffiliatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Affiliate Dashboard</h2>
        <p className="text-gray-400">
          Share your referral link and earn commission from every referral.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Total Earnings</div>
          <div className="text-3xl font-bold">Rp 0</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Available Balance</div>
          <div className="text-3xl font-bold">Rp 0</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Total Referrals</div>
          <div className="text-3xl font-bold">0</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Your Referral Link</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value="https://sociotools.com/sign-up?ref=YOUR_CODE"
            readOnly
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
          />
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
            Copy
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Earnings History</h3>
        <div className="text-center py-8 text-gray-500">
          No earnings yet. Start sharing your referral link!
        </div>
      </div>
    </div>
  );
}
