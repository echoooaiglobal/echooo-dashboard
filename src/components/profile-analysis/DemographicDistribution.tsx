// src/components/profile-analysis/DemographicDistribution.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DemographicDistributionProps {
  title: string;
  data: Record<string, number> | undefined;
  colors: string[];
}

export default function DemographicDistribution({
  title,
  data,
  colors
}: DemographicDistributionProps) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-md font-medium mb-3">{title}</h4>
        <p className="text-center text-gray-500">No data available</p>
      </div>
    );
  }
  
  const chartData = Object.entries(data).map(([name, value], index) => ({
    name,
    value,
    color: colors[index % colors.length]
  }));
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h4 className="text-md font-medium mb-3">{title}</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
