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
    <div className="bg-void border-2 border-gold/18 rounded-xl p-7 h-full">
      <p className="font-outfit text-[9px] font-medium tracking-[3px] uppercase text-slate mb-5">
        Trust History
        <i className="fa-solid fa-chart-simple ml-2 text-xs"></i>
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trustGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(122,122,140,0.35)" />
          <XAxis
            dataKey="month"
            tick={{
              fontSize: 10,
              fill: "var(--color-slate)",
              fontFamily: "var(--font-outfit)",
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "var(--color-void)",
              border: "1px solid rgba(196,163,90,0.2)",
              borderRadius: "2px",
              fontSize: "12px",
              fontFamily: "var(--font-outfit)",
              color: "var(--color-ivory)",
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--color-gold)"
            strokeWidth={1.5}
            fill="url(#trustGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
