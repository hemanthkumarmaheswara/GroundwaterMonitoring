import { useMemo } from "react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Legend, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Droplets, TrendingDown, TrendingUp, AlertTriangle, Activity, MapPin, Building2 } from "lucide-react";
import { getStateStats } from "@/lib/mockData";
import { useStations } from "@/hooks/useStations";

const STATUS_COLORS = {
  Normal: "hsl(152, 69%, 41%)",
  Warning: "hsl(38, 92%, 50%)",
  Critical: "hsl(0, 84%, 60%)",
};

const TREND_COLORS = {
  Rising: "hsl(152, 69%, 41%)",
  Stable: "hsl(199, 89%, 48%)",
  Falling: "hsl(0, 84%, 60%)",
};

export default function Analytics() {
  const { data: stations = [], isLoading } = useStations();

  const statusData = useMemo(() => {
    const counts = { Normal: 0, Warning: 0, Critical: 0 };
    stations.forEach(s => counts[s.status]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [stations]);

  const trendData = useMemo(() => {
    const counts = { rising: 0, falling: 0, stable: 0 };
    stations.forEach(s => counts[s.trend]++);
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [stations]);

  const stateStats = useMemo(() => getStateStats(stations).slice(0, 8), [stations]);

  // KPI metrics
  const kpis = useMemo(() => {
    if (!stations.length) return null;
    const levels = stations.map(s => s.level);
    const avgLevel = (levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(2);
    const maxLevel = Math.max(...levels).toFixed(2);
    const minLevel = Math.min(...levels).toFixed(2);
    const criticalPct = ((stations.filter(s => s.status === "Critical").length / stations.length) * 100).toFixed(1);
    const fallingPct = ((stations.filter(s => s.trend === "falling").length / stations.length) * 100).toFixed(1);
    const uniqueStates = new Set(stations.map(s => s.state)).size;
    const uniqueDistricts = new Set(stations.map(s => s.district)).size;
    return { avgLevel, maxLevel, minLevel, criticalPct, fallingPct, uniqueStates, uniqueDistricts };
  }, [stations]);

  // Depth distribution (histogram buckets)
  const depthDistribution = useMemo(() => {
    const buckets = [
      { range: "0-5m", min: 0, max: 5, count: 0 },
      { range: "5-10m", min: 5, max: 10, count: 0 },
      { range: "10-15m", min: 10, max: 15, count: 0 },
      { range: "15-20m", min: 15, max: 20, count: 0 },
      { range: "20-30m", min: 20, max: 30, count: 0 },
      { range: "30-40m", min: 30, max: 40, count: 0 },
      { range: "40-50m", min: 40, max: 50, count: 0 },
    ];
    stations.forEach(s => {
      const b = buckets.find(b => s.level >= b.min && s.level < b.max);
      if (b) b.count++;
    });
    return buckets.map(({ range, count }) => ({ range, count }));
  }, [stations]);

  // State-wise status breakdown (top 8 states, stacked)
  const stateStatusBreakdown = useMemo(() => {
    return stateStats.map(s => ({
      state: s.state.length > 12 ? s.state.slice(0, 11) + "…" : s.state,
      Normal: s.normal,
      Warning: s.warning,
      Critical: s.critical,
    }));
  }, [stateStats]);

  // Agency distribution
  const agencyData = useMemo(() => {
    const map = new Map<string, number>();
    stations.forEach(s => {
      const agency = s.agencyName || "Unknown";
      map.set(agency, (map.get(agency) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 19) + "…" : name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [stations]);

  // Top critical stations
  const criticalStations = useMemo(() => {
    return stations
      .filter(s => s.status === "Critical")
      .sort((a, b) => b.level - a.level)
      .slice(0, 10);
  }, [stations]);

  // Radar: state health score
  const radarData = useMemo(() => {
    return stateStats.slice(0, 6).map(s => ({
      state: s.state.length > 10 ? s.state.slice(0, 9) + "…" : s.state,
      health: Math.round((s.normal / s.total) * 100),
      risk: Math.round(((s.critical + s.warning) / s.total) * 100),
    }));
  }, [stateStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">In-depth statistical analysis of groundwater monitoring data</p>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {[
            { label: "Avg Depth", value: `${kpis.avgLevel}m`, icon: Droplets, color: "text-primary" },
            { label: "Max Depth", value: `${kpis.maxLevel}m`, icon: TrendingDown, color: "text-destructive" },
            { label: "Min Depth", value: `${kpis.minLevel}m`, icon: TrendingUp, color: "text-success" },
            { label: "Critical %", value: `${kpis.criticalPct}%`, icon: AlertTriangle, color: "text-destructive" },
            { label: "Falling %", value: `${kpis.fallingPct}%`, icon: Activity, color: "text-warning" },
            { label: "States", value: kpis.uniqueStates, icon: MapPin, color: "text-accent" },
            { label: "Districts", value: kpis.uniqueDistricts, icon: Building2, color: "text-primary" },
          ].map(kpi => (
            <div key={kpi.label} className="bg-card p-3 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                <span className="text-[11px] text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-lg font-display font-bold text-card-foreground">{kpi.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Row 1: Status + Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-lg font-display font-bold text-card-foreground mb-4">Water Level Trends</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214, 32%, 91%)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Stations">
                  {trendData.map((entry) => (
                    <Cell key={entry.name} fill={TREND_COLORS[entry.name as keyof typeof TREND_COLORS] || "hsl(199, 89%, 48%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Depth Distribution + State Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-lg font-display font-bold text-card-foreground mb-4">Depth Distribution</h3>
          <p className="text-xs text-muted-foreground mb-3">Number of stations by water level depth range (mbgl)</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={depthDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214, 32%, 91%)' }} />
                <Area type="monotone" dataKey="count" fill="hsl(199, 89%, 48%)" fillOpacity={0.2} stroke="hsl(199, 89%, 48%)" strokeWidth={2} name="Stations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-lg font-display font-bold text-card-foreground mb-4">State-wise Status Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-3">Top 8 states by station count with status split</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateStatusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="state" tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214, 32%, 91%)' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Normal" stackId="a" fill={STATUS_COLORS.Normal} name="Normal" />
                <Bar dataKey="Warning" stackId="a" fill={STATUS_COLORS.Warning} name="Warning" />
                <Bar dataKey="Critical" stackId="a" fill={STATUS_COLORS.Critical} radius={[4, 4, 0, 0]} name="Critical" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: State Health Radar + Agency Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-lg font-display font-bold text-card-foreground mb-4">State Health Score</h3>
          <p className="text-xs text-muted-foreground mb-3">% of stations at Normal vs At-Risk (Warning + Critical)</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(214, 32%, 91%)" />
                <PolarAngleAxis dataKey="state" tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }} domain={[0, 100]} />
                <Radar name="Health %" dataKey="health" stroke="hsl(152, 69%, 41%)" fill="hsl(152, 69%, 41%)" fillOpacity={0.2} />
                <Radar name="Risk %" dataKey="risk" stroke="hsl(0, 84%, 60%)" fill="hsl(0, 84%, 60%)" fillOpacity={0.15} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214, 32%, 91%)' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-lg font-display font-bold text-card-foreground mb-4">Agency Distribution</h3>
          <p className="text-xs text-muted-foreground mb-3">Top agencies by number of managed stations</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agencyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(214, 32%, 91%)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }} tickLine={false} axisLine={false} width={120} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214, 32%, 91%)' }} />
                <Bar dataKey="value" fill="hsl(168, 76%, 42%)" radius={[0, 6, 6, 0]} name="Stations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: State Avg Water Level (full width) */}
      <div className="bg-card p-6 rounded-xl border border-border">
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

      {/* Row 5: Critical Stations Table */}
      <div className="bg-card p-6 rounded-xl border border-border">
        <h3 className="text-lg font-display font-bold text-card-foreground mb-1">Top Critical Stations</h3>
        <p className="text-xs text-muted-foreground mb-4">Stations with the highest water level depth requiring immediate attention</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Station</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">State</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">District</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs">Depth (mbgl)</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium text-xs">Trend</th>
              </tr>
            </thead>
            <tbody>
              {criticalStations.map(s => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="py-2 px-3 font-medium text-card-foreground text-xs">{s.name}</td>
                  <td className="py-2 px-3 text-muted-foreground text-xs">{s.state}</td>
                  <td className="py-2 px-3 text-muted-foreground text-xs">{s.district}</td>
                  <td className="py-2 px-3 text-right font-mono text-destructive font-semibold text-xs">{s.level}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                      s.trend === "falling" ? "text-destructive" : s.trend === "rising" ? "text-success" : "text-primary"
                    }`}>
                      {s.trend === "falling" ? <TrendingDown className="h-3 w-3" /> : s.trend === "rising" ? <TrendingUp className="h-3 w-3" /> : null}
                      {s.trend.charAt(0).toUpperCase() + s.trend.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}