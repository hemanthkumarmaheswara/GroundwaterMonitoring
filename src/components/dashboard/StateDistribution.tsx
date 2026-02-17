import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { getStateStats } from "@/lib/mockData";

export default function StateDistribution() {
  const data = useMemo(() => getStateStats().slice(0, 10), []);

  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <div className="mb-4">
        <h3 className="text-lg font-display font-bold text-card-foreground">Stations by State</h3>
        <p className="text-sm text-muted-foreground">Top 10 states by DWLR station count</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(214, 32%, 91%)" />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="state" tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} tickLine={false} axisLine={false} width={120} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214, 32%, 91%)' }} />
            <Bar dataKey="normal" stackId="a" fill="hsl(152, 69%, 41%)" name="Normal" radius={[0, 0, 0, 0]} />
            <Bar dataKey="warning" stackId="a" fill="hsl(38, 92%, 50%)" name="Warning" />
            <Bar dataKey="critical" stackId="a" fill="hsl(0, 84%, 60%)" name="Critical" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
