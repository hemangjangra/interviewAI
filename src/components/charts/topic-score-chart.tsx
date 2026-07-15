'use client';

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

interface TopicScoreChartProps {
  data: { name: string; score: number }[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg text-sm">
      <div className="font-medium">{payload[0]?.payload?.name}</div>
      <div className="text-muted-foreground">Score: <span className="font-semibold text-foreground">{payload[0]?.value}/100</span></div>
    </div>
  );
}

export function TopicScoreChart({ data }: TopicScoreChartProps) {
  if (data.length < 3) {
    // Radar needs at least 3 points; fall back to bar-style display
    return (
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.name}>
            <div className="flex justify-between text-sm mb-1">
              <span>{d.name}</span>
              <span className="font-medium">{d.score}/100</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${d.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
