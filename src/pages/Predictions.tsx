import { useState, useEffect, useMemo } from "react";
import { useStations } from "@/hooks/useStations";
import { Station } from "@/lib/mockData";
import { getStationPrediction, PredictionPoint } from "@/services/predictionService";
import PredictionChart from "@/components/dashboard/PredictionChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Brain, Clock, Target, TrendingUp, ChevronsUpDown, Check } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { cn } from "@/lib/utils";

export default function Predictions() {
  const { data: stations = [], isLoading: stationsLoading } = useStations();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [data, setData] = useState<PredictionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [forecastDays, setForecastDays] = useState("30");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Set default station once loaded
  useEffect(() => {
    if (stations.length > 0 && !selectedStation) {
      setSelectedStation(stations[0]);
    }
  }, [stations, selectedStation]);

  useEffect(() => {
    if (!selectedStation) return;
    setLoading(true);
    getStationPrediction(selectedStation.id, parseInt(forecastDays)).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [selectedStation, forecastDays]);

  // Only show first 100 matching stations in the dropdown for performance
  const filteredStations = useMemo(() => {
    if (!searchQuery) return stations.slice(0, 100);
    const q = searchQuery.toLowerCase();
    return stations
      .filter(s => s.name.toLowerCase().includes(q) || s.state.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
      .slice(0, 100);
  }, [stations, searchQuery]);

  const predictedPoints = data.filter(d => d.type === 'Predicted');
  const avgPredicted = predictedPoints.length ? (predictedPoints.reduce((s, p) => s + p.level, 0) / predictedPoints.length).toFixed(2) : "—";
  const maxPredicted = predictedPoints.length ? Math.max(...predictedPoints.map(p => p.level)).toFixed(2) : "—";

  if (stationsLoading || !selectedStation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">LSTM Predictions</h1>
        <p className="text-muted-foreground mt-1">AI-powered groundwater level forecasting using Long Short-Term Memory neural networks</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Model Type" value="LSTM v2.1" icon={Brain} variant="primary" />
        <StatCard title="Forecast Window" value={`${forecastDays} Days`} icon={Clock} variant="default" />
        <StatCard title="Avg. Predicted" value={`${avgPredicted} m`} icon={Target} variant="warning" />
        <StatCard title="Peak Level" value={`${maxPredicted} m`} icon={TrendingUp} variant="destructive" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full sm:w-[350px] justify-between font-normal">
              {selectedStation.name} — {selectedStation.state}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput placeholder="Search station..." value={searchQuery} onValueChange={setSearchQuery} />
              <CommandList>
                <CommandEmpty>No station found.</CommandEmpty>
                <CommandGroup>
                  {filteredStations.map(s => (
                    <CommandItem
                      key={s.id}
                      value={s.id}
                      onSelect={() => {
                        setSelectedStation(s);
                        setOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedStation.id === s.id ? "opacity-100" : "opacity-0")} />
                      <span className="truncate">{s.name} — {s.state}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Select value={forecastDays} onValueChange={setForecastDays}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 Days</SelectItem>
            <SelectItem value="15">15 Days</SelectItem>
            <SelectItem value="30">30 Days</SelectItem>
            <SelectItem value="60">60 Days</SelectItem>
            <SelectItem value="90">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="bg-card rounded-xl border border-border h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Running LSTM model for {selectedStation.name}...</p>
          </div>
        </div>
      ) : (
        <PredictionChart data={data} title={`Forecast: ${selectedStation.name}`} subtitle={`${selectedStation.district}, ${selectedStation.state} · ${forecastDays}-day LSTM prediction`} />
      )}

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-foreground mb-3">About the LSTM Model</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
          <div>
            <h4 className="font-semibold text-foreground mb-1">Architecture</h4>
            <p>2-layer LSTM with 64 hidden units, trained on 10+ years of DWLR time-series data with attention mechanism for seasonal pattern recognition.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Synthetic Data</h4>
            <p>Missing years (2017, 2019, 2021) are gap-filled using the trained model, generating synthetic groundwater levels that maintain temporal coherence.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Confidence Intervals</h4>
            <p>95% confidence bands widen over time, reflecting increasing uncertainty in longer-range forecasts. Model achieves 87% accuracy on validation data.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
