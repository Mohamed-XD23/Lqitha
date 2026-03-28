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
import { LineChart } from "lucide-react";
import type { Dictionary } from "@/lib/dictionary.types";

interface Props {
  data: { month: string; score: number }[];
  dict: Dictionary;
}

export default function TrustChart({ data, dict }: Props) {

const t = dict.trustChart;

  return (
    <div className="bg-void border border-gold/18 rounded-sm p-7 h-full shadow-xl">
      <p className="font-interface text-[9px] font-semibold tracking-[3px] uppercase text-slate mb-8 flex items-center gap-2">
        <LineChart className="w-3.5 h-3.5 text-gold/60" strokeWidth={2} />
        {t.title}
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trustGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C4A35A" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#C4A35A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(196,163,90,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{
              fontSize: 10,
              fill: "#7A7A8C",
              fontFamily: "var(--font-interface)",
            }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "#13131F",
              border: "1px solid rgba(196,163,90,0.2)",
              borderRadius: "2px",
              fontSize: "11px",
              fontFamily: "var(--font-interface)",
              color: "#F2EFE8",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
            }}
            itemStyle={{ color: "#C4A35A" }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#C4A35A"
            strokeWidth={2}
            fill="url(#trustGradient)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
