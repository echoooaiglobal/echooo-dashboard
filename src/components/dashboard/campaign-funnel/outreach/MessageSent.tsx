// src/components/dashboard/campaign-funnel/outreach/MessageSent.tsx
const MessageSent = () => {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold mb-3">Message Sent (430)</h3>
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
    </div>
  );
};

export default MessageSent;