"use client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const Charts = ({
  salesData,
}: {
  salesData: { month: string; totalSales: number }[];
}) => {
  if (salesData.length > 12) {
    salesData = salesData.slice(salesData.length - 12); // Get last 12 months
  }
  salesData = salesData
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()); // Sort by month

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={salesData}>
        <XAxis
          dataKey="month"
          stroke="#888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar
          dataKey="totalSales"
          fill="#currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Charts;
