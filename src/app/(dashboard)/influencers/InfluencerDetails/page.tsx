import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function InfluencerDetails() {
  const influencer = {
    name: "Jane Doe",
    followers: 120000,
    following: 350,
    likes: 5200,
    comments: 1100,
    reach: 300000,
  };

  const reachData = [
    { name: "Followers", value: influencer.followers },
    { name: "Reach", value: influencer.reach },
  ];

  const engagementData = [
    { name: "Likes", value: influencer.likes },
    { name: "Comments", value: influencer.comments },
  ];

  const COLORS = ["#e1306c", "#833ab4"]; // Instagram pink & purple

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 py-12 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-10 md:p-14">
        {/* Heading */}
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            @{influencer.name.replace(" ", "").toLowerCase()}
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mt-3">
            Your Personalized Instagram Insights Dashboard
          </p>
        </header>

        {/* Audience Reach Chart */}
        <div className="mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-purple-700 mb-6">
              Audience Reach
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reachData} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#8b5cf6"
                  animationDuration={1000}
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Breakdown Chart */}
        <div className="mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-pink-600 mb-6">
              Engagement Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                  animationDuration={1000}
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Following Count */}
        <div className="text-center border-t border-indigo-200 pt-8">
          <p className="text-2xl text-gray-800">
            Following{" "}
            <span className="font-bold text-purple-700">{influencer.following}</span> accounts
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Building community, collabs & content inspiration.
          </p>
        </div>
      </div>
    </div>
  );
}
