import { Droplets, MapPin, AlertTriangle, TrendingDown } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import WaterTrendChart from "@/components/dashboard/WaterTrendChart";
import StationTable from "@/components/dashboard/StationTable";
import StateDistribution from "@/components/dashboard/StateDistribution";
import { useStations } from "@/hooks/useStations";

const Index = () => {
  const { data: stations = [], isLoading } = useStations();

  const totalStations = stations.length;
  const criticalCount = stations.filter(s => s.status === 'Critical').length;
  const warningCount = stations.filter(s => s.status === 'Warning').length;
  const avgLevel = totalStations ? (stations.reduce((sum, s) => sum + s.level, 0) / totalStations).toFixed(1) : "0";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time groundwater monitoring across India's DWLR network</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Stations" value={totalStations.toLocaleString()} icon={MapPin} trend="+12" trendUp variant="primary" />
        <StatCard title="Avg. Water Level" value={`${avgLevel} m`} icon={Droplets} trend="-0.3m" variant="default" />
        <StatCard title="Critical Alerts" value={criticalCount} icon={AlertTriangle} trend="+2" variant="destructive" />
        <StatCard title="Declining Levels" value={warningCount} icon={TrendingDown} trend="-5" trendUp variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterTrendChart />
        <StateDistribution stations={stations} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-foreground">Recent Station Data</h2>
          <a href="/stations" className="text-sm text-primary hover:underline font-medium">View all →</a>
        </div>
        <StationTable stations={stations} limit={10} />
      </div>
    </div>
  );
};

export default Index;
