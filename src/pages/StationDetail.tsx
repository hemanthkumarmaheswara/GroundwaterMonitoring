import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useStations } from "@/hooks/useStations";
import { getStationPrediction, PredictionPoint } from "@/services/predictionService";
import PredictionChart from "@/components/dashboard/PredictionChart";
import StatCard from "@/components/dashboard/StatCard";
import { ArrowLeft, Droplets, MapPin, Activity, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";


export default function StationDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: stations = [], isLoading: stationsLoading } = useStations();
  const station = stations.find(s => s.id === id);
  const [predictionData, setPredictionData] = useState<PredictionPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!station) return;
    setLoading(true);
    getStationPrediction(station.id).then((pred) => {
      setPredictionData(pred);
      setLoading(false);
    });
  }, [station]);

  if (stationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-display font-bold text-foreground">Station Not Found</h2>
        <Link to="/stations" className="text-primary hover:underline mt-2 inline-block">← Back to Stations</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/stations" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{station.name}</h1>
          <p className="text-muted-foreground text-sm">{station.district}, {station.state} · {station.id}</p>
        </div>
        <Badge variant={station.status === 'Critical' ? 'destructive' : station.status === 'Warning' ? 'outline' : 'secondary'} className="ml-auto text-sm">
          {station.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Current Level" value={`${station.level.toFixed(2)} m`} icon={Droplets} variant="primary" />
        <StatCard title="Location" value={`${station.lat.toFixed(3)}°N`} icon={MapPin} variant="default" />
        <StatCard title="Station Type" value={station.stationType} icon={Activity} variant="default" />
        <StatCard title="Last Update" value="Just now" icon={Clock} variant="success" />
      </div>

      <div>
        <h2 className="text-lg font-display font-bold text-foreground mb-4">LSTM Forecast</h2>
        {loading ? (
          <div className="bg-card rounded-xl border border-border h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Running LSTM prediction model...</p>
            </div>
          </div>
        ) : (
          <PredictionChart data={predictionData} />
        )}
      </div>
    </div>
  );
}
