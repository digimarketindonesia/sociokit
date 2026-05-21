export default function FbAccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Facebook Accounts Management</h2>
        <p className="text-gray-400">
          Manage your connected Facebook accounts and fanspages.
        </p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Facebook Cookies</h3>
        <textarea
          placeholder="Paste your Facebook cookies here"
          rows={6}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Security Disclaimer: We do not store raw cookies. All cookies are stored using encryption.
        </p>

        <div className="flex items-center gap-4 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Use Proxy for this account</span>
          </label>
        </div>

        <button className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
          Add Account
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <input
          type="text"
          placeholder="Search by name, Facebook ID, or fanpage"
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 mb-4"
        />

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Avatar</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Facebook Name</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Facebook ID</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Proxy Status</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Fanpages</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Created At</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No accounts found. Add one to get started.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
