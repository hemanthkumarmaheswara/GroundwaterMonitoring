import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { MOCK_STATIONS, getStateStats } from "@/lib/mockData";

const STATUS_COLORS = {
  Normal: "hsl(152, 69%, 41%)",
  Warning: "hsl(38, 92%, 50%)",
  Critical: "hsl(0, 84%, 60%)",
};

export default function Analytics() {
  const statusData = useMemo(() => {
    const counts = { Normal: 0, Warning: 0, Critical: 0 };
    MOCK_STATIONS.forEach(s => counts[s.status]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const trendData = useMemo(() => {
    const counts = { rising: 0, falling: 0, stable: 0 };
    MOCK_STATIONS.forEach(s => counts[s.trend]++);
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, []);

  const stateStats = useMemo(() => getStateStats().slice(0, 8), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Statistical overview of groundwater monitoring data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-lg font-display font-bold text-card-foreground mb-4">Status Distribution</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Distribution */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-lg font-display font-bold text-card-foreground mb-4">Water Level Trends</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214, 32%, 91%)' }} />
                <Bar dataKey="value" fill="hsl(199, 89%, 48%)" radius={[6, 6, 0, 0]} name="Stations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State-wise Average Levels */}
        <div className="bg-card p-6 rounded-xl border border-border lg:col-span-2">
          <h3 className="text-lg font-display font-bold text-card-foreground mb-4">State-wise Average Water Level</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="state" tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} tickLine={false} axisLine={false} label={{ value: 'Avg Level (mbgl)', angle: -90, position: 'insideLeft', fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214, 32%, 91%)' }} />
                <Legend />
                <Bar dataKey="avgLevel" fill="hsl(199, 89%, 48%)" radius={[6, 6, 0, 0]} name="Avg. Level (mbgl)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
