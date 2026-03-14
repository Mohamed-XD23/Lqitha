"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { month: string; score: number }[];
}

export default function TrustChart({ data }: Props) {
  return (
    <div
      style={{
        background: "#13131F",
        border: "1px solid rgba(196,163,90,0.18)",
        borderRadius: "4px",
        padding: "28px",
        height: "100%",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-outfit)",
          fontSize: "9px",
          fontWeight: 500,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "#7A7A8C",
          marginBottom: "20px",
        }}
      >
        Trust History
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trustGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C4A35A" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#C4A35A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,163,90,0.08)" />
          <XAxis
            dataKey="month"
            tick={{
              fontSize: 11,
              fill: "#7A7A8C",
              fontFamily: "var(--font-outfit)",
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "#13131F",
              border: "1px solid rgba(196,163,90,0.2)",
              borderRadius: "2px",
              fontSize: "12px",
              fontFamily: "var(--font-outfit)",
              color: "#F2EFE8",
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#C4A35A"
            strokeWidth={1.5}
            fill="url(#trustGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
