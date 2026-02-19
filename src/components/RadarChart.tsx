"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { DimensionResult } from "@/lib/diagnostic-data";

interface RadarChartProps {
  results: DimensionResult[];
}

export default function RadarChart({ results }: RadarChartProps) {
  const data = results.map((r) => ({
    dimension: r.dimension.name.replace(" ", "\n"),
    score: r.percentage,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-[350px] md:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#e5e5e5" strokeDasharray="2 2" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{
              fontSize: 11,
              fill: "#6b6b6b",
              fontFamily: "'Libre Baskerville', Georgia, serif",
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Max"
            dataKey="fullMark"
            stroke="#e5e5e5"
            fill="none"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#FF5F1F"
            fill="#FF5F1F"
            fillOpacity={0.12}
            strokeWidth={2}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
