import { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { generateHistoricalData } from "@/lib/mockData";

export default function WaterTrendChart() {
  const data = useMemo(() => generateHistoricalData(), []);

  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <div className="mb-4">
        <h3 className="text-lg font-display font-bold text-card-foreground">Average Water Level Trend</h3>
        <p className="text-sm text-muted-foreground">Last 30 Days — National Average (mbgl)</p>
      </div>
      <div className="h-[300px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 32%, 91%)" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 11 }} dy={10} interval="preserveStartEnd" minTickGap={40} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214, 32%, 91%)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
            <Area type="monotone" dataKey="level" stroke="hsl(199, 89%, 48%)" fillOpacity={1} fill="url(#colorLevel)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
