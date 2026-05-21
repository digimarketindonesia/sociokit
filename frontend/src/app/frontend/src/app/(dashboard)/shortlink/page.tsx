export default function ShortlinkPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Shortlink</h2>
        <p className="text-gray-400">
          Create cloaked short URLs, content previews, target routing, and hit stats.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Link Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Domain</label>
              <select className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg">
                <option>Random</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Custom Slug</label>
              <input
                type="text"
                placeholder="my-campaign"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Routing Targets</label>
              <div className="flex gap-2 mb-2">
                <button className="px-3 py-1 bg-blue-600 rounded text-sm">🌐 Target</button>
                <button className="px-3 py-1 bg-gray-700 rounded text-sm">🖥️ Desktop</button>
                <button className="px-3 py-1 bg-gray-700 rounded text-sm">📱 Mobile</button>
              </div>
              <input
                type="url"
                placeholder="https://target-domain.com/path"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Page Details</h3>
          <p className="text-sm text-gray-400 mb-4">
            Control what crawlers see before visitors are routed.
          </p>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-blue-600 rounded">Fakeurl</button>
              <button className="flex-1 py-2 bg-gray-700 rounded">Content</button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fake URL</label>
              <input
                type="url"
                placeholder="https://facebook.com/my-page"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                The URL that crawlers and bots will see.
              </p>
            </div>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
              Generate Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
