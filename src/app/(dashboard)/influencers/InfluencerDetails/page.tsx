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
      <h1>Comming Soon</h1>
    </div>
  );
}
