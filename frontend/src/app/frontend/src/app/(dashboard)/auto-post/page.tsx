export default function AutoPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Facebook Auto Post Group</h2>
        <p className="text-gray-400">
          Auto post content to multiple Facebook groups at once.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Setup Post</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Facebook Account</label>
              <select className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg">
                <option>Select account...</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Caption (optional)</label>
              <textarea
                rows={4}
                placeholder="Write your caption..."
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Link URL (optional)</label>
              <input
                type="url"
                placeholder="https://example.com"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Thread (rec. 1)</label>
                <input
                  type="number"
                  defaultValue={1}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Delay (detik) (rec. 3)</label>
                <input
                  type="number"
                  defaultValue={3}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                />
              </div>
            </div>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
              Post to 0 Group
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Group Select</h3>
          <input
            type="text"
            placeholder="Search group name or ID..."
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg mb-4"
          />
          <div className="text-sm text-gray-400 text-center py-8">
            Select a Facebook account first
          </div>
        </div>
      </div>
    </div>
  );
}
