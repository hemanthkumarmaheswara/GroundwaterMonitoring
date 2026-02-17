import { useMemo } from "react";
import { Droplets, MapPin, AlertTriangle, TrendingDown, TrendingUp, Activity, Users, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import StatCard from "@/components/dashboard/StatCard";
import WaterTrendChart from "@/components/dashboard/WaterTrendChart";
import StationTable from "@/components/dashboard/StationTable";
import StateDistribution from "@/components/dashboard/StateDistribution";
import { useStations } from "@/hooks/useStations";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const STATUS_COLORS = {
  Normal: "hsl(160, 64%, 43%)",
  Warning: "hsl(32, 95%, 52%)",
  Critical: "hsl(354, 70%, 54%)",
};

const Index = () => {
  const { data: stations = [], isLoading } = useStations();

  const totalStations = stations.length;
  const criticalCount = stations.filter(s => s.status === 'Critical').length;
  const warningCount = stations.filter(s => s.status === 'Warning').length;
  const normalCount = stations.filter(s => s.status === 'Normal').length;
  const avgLevel = totalStations ? (stations.reduce((sum, s) => sum + s.level, 0) / totalStations).toFixed(1) : "0";

  const statusData = useMemo(() => [
    { name: "Normal", value: normalCount },
    { name: "Warning", value: warningCount },
    { name: "Critical", value: criticalCount },
  ], [normalCount, warningCount, criticalCount]);

  const trendCounts = useMemo(() => ({
    rising: stations.filter(s => s.trend === "rising").length,
    stable: stations.filter(s => s.trend === "stable").length,
    falling: stations.filter(s => s.trend === "falling").length,
  }), [stations]);

  const topCritical = useMemo(() =>
    stations.filter(s => s.status === "Critical").sort((a, b) => b.level - a.level).slice(0, 5),
  [stations]);

  const stateCount = useMemo(() => new Set(stations.map(s => s.state)).size, [stations]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading station data...</p>
        </div>
      </div>
    );
  }

  const normalPct = totalStations ? Math.round((normalCount / totalStations) * 100) : 0;
  const warningPct = totalStations ? Math.round((warningCount / totalStations) * 100) : 0;
  const criticalPct = totalStations ? Math.round((criticalCount / totalStations) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time groundwater monitoring across India's DWLR network</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Stations" value={totalStations.toLocaleString()} icon={MapPin} trend="+12" trendUp variant="primary" />
        <StatCard title="Avg. Water Level" value={`${avgLevel} m`} icon={Droplets} trend="-0.3m" variant="default" />
        <StatCard title="Critical Alerts" value={criticalCount} icon={AlertTriangle} trend="+2" variant="destructive" />
        <StatCard title="Declining Levels" value={warningCount} icon={TrendingDown} trend="-5" trendUp variant="warning" />
      </div>

      {/* Status Overview + Health Breakdown + Trend Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Donut */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-lg font-display font-bold text-card-foreground mb-2">Status Overview</h3>
          <p className="text-xs text-muted-foreground mb-3">Current station health distribution</p>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={2} stroke="hsl(0, 0%, 100%)">
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214, 32%, 91%)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[s.name as keyof typeof STATUS_COLORS] }} />
                <span className="text-xs text-muted-foreground">{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Health Breakdown */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-lg font-display font-bold text-card-foreground mb-2">Health Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Percentage of stations by status</p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-card-foreground font-medium">Normal</span>
                <span className="text-muted-foreground">{normalCount.toLocaleString()} ({normalPct}%)</span>
              </div>
              <Progress value={normalPct} className="h-2.5 [&>div]:bg-[hsl(160,64%,43%)]" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-card-foreground font-medium">Warning</span>
                <span className="text-muted-foreground">{warningCount.toLocaleString()} ({warningPct}%)</span>
              </div>
              <Progress value={warningPct} className="h-2.5 [&>div]:bg-[hsl(32,95%,52%)]" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-card-foreground font-medium">Critical</span>
                <span className="text-muted-foreground">{criticalCount.toLocaleString()} ({criticalPct}%)</span>
              </div>
              <Progress value={criticalPct} className="h-2.5 [&>div]:bg-[hsl(354,70%,54%)]" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stateCount} States Monitored</span>
            </div>
            <Link to="/analytics" className="text-xs text-primary font-medium hover:underline">Full Analytics →</Link>
          </div>
        </div>

        {/* Trend Summary */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-lg font-display font-bold text-card-foreground mb-2">Trend Summary</h3>
          <p className="text-xs text-muted-foreground mb-4">Water level movement across all stations</p>
          <div className="space-y-3">
            {[
              { label: "Rising", count: trendCounts.rising, icon: ArrowUp, color: "text-destructive", bg: "bg-destructive/10" },
              { label: "Stable", count: trendCounts.stable, icon: Minus, color: "text-primary", bg: "bg-primary/10" },
              { label: "Falling", count: trendCounts.falling, icon: ArrowDown, color: "text-success", bg: "bg-success/10" },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className={cn("p-2 rounded-lg", t.bg)}>
                  <t.icon className={cn("h-4 w-4", t.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{totalStations ? ((t.count / totalStations) * 100).toFixed(1) : 0}% of stations</p>
                </div>
                <span className="text-lg font-display font-bold text-card-foreground">{t.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <Link to="/predictions" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" /> View LSTM Predictions →
            </Link>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterTrendChart />
        <StateDistribution stations={stations} />
      </div>

      {/* Critical Alerts + Station Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Alerts Panel */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-card-foreground">Critical Alerts</h3>
              <p className="text-xs text-muted-foreground">Top 5 stations needing attention</p>
            </div>
          </div>
          <div className="space-y-2">
            {topCritical.map(s => (
              <Link key={s.id} to={`/stations/${s.id}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="w-1 h-8 rounded-full bg-destructive" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate group-hover:text-primary transition-colors">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.district}, {s.state}</p>
                </div>
                <span className="text-sm font-mono font-bold text-destructive">{s.level.toFixed(1)}m</span>
              </Link>
            ))}
          </div>
          {criticalCount > 5 && (
            <Link to="/stations" className="block text-center text-xs text-primary font-medium hover:underline mt-3 pt-3 border-t border-border">
              View all {criticalCount} critical stations →
            </Link>
          )}
        </div>

        {/* Recent Station Data */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-foreground">Recent Station Data</h2>
            <Link to="/stations" className="text-sm text-primary hover:underline font-medium">View all →</Link>
          </div>
          <StationTable stations={stations} limit={10} />
        </div>
      </div>
    </div>
  );
};

export default Index;
