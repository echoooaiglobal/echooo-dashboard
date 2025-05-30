// src/components/dashboard/campaign-funnel/outreach/ReadyToOnboard.tsx
const ReadyToOnboard = () => {
  return (
    <div className="bg-white rounded-xl shadow p-4 relative">
      <h3 className="text-lg font-semibold mb-3">Ready to Onboard (343)</h3>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 border"
          >
            <div className="flex items-center space-x-3">
              <img
                src="https://via.placeholder.com/32"
                alt="avatar"
                className="rounded-full w-8 h-8"
              />
              <div>
                <p className="text-sm font-medium">Gianna Lipshutz</p>
                <p className="text-xs text-gray-500">@gianna</p>
              </div>
            </div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/1384/1384031.png"
              alt="Instagram"
              className="w-4 h-4"
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-0 w-full flex justify-around px-4">
        <button className="px-4 py-2 bg-white border border-red-500 text-red-500 rounded-lg">
          Select Manually
        </button>
        <button className="px-4 py-2 bg-purple-500 text-white rounded-lg">
          ✨ Select with AI
        </button>
      </div>
    </div>
  );
};

export default ReadyToOnboard;