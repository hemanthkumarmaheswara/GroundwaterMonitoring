import { useState, useEffect, useMemo } from "react";
import { useStations } from "@/hooks/useStations";
import { Station } from "@/lib/mockData";
import { getStationPrediction, PredictionPoint } from "@/services/predictionService";
import PredictionChart from "@/components/dashboard/PredictionChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Brain, Clock, Target, TrendingUp, ChevronsUpDown, Check, CalendarIcon, X } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Predictions() {
  const { data: stations = [], isLoading: stationsLoading } = useStations();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [data, setData] = useState<PredictionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [forecastDays, setForecastDays] = useState("30");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Month filter state
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(undefined);

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

  // Filter data by selected month if set
  const filteredData = useMemo(() => {
    if (!selectedMonth) return data;
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    // Always include some historical context (last 7 days before month start)
    const contextStart = new Date(start);
    contextStart.setDate(contextStart.getDate() - 7);
    return data.filter(d => d.dateObj >= contextStart && d.dateObj <= end);
  }, [data, selectedMonth]);

  const predictedPoints = filteredData.filter(d => d.type === 'Predicted');
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
        <StatCard title="Forecast Window" value={forecastDays === "all" ? "Full Year" : `${forecastDays} Days`} icon={Clock} variant="default" />
        <StatCard title="Avg. Predicted" value={`${avgPredicted} m`} icon={Target} variant="warning" />
        <StatCard title="Peak Level" value={`${maxPredicted} m`} icon={TrendingUp} variant="destructive" />
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Station selector */}
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

        {/* Forecast days */}
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

        {/* Month filter */}
        <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[200px] justify-start text-left font-normal",
                !selectedMonth && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedMonth ? format(selectedMonth, "MMMM yyyy") : "Filter by month"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedMonth}
              onSelect={(date) => {
                setSelectedMonth(date);
                setMonthPickerOpen(false);
              }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
              // Show only month/year navigation, restrict to future 12 months + past 3 months
              fromDate={new Date(new Date().setMonth(new Date().getMonth() - 3))}
              toDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
            />
          </PopoverContent>
        </Popover>

        {/* Clear month filter badge */}
        {selectedMonth && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-muted self-center"
            onClick={() => setSelectedMonth(undefined)}
          >
            {format(selectedMonth, "MMM yyyy")}
            <X className="h-3 w-3" />
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="bg-card rounded-xl border border-border h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Running LSTM model for {selectedStation.name}...</p>
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-card rounded-xl border border-border h-[300px] flex items-center justify-center">
          <div className="text-center">
            <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No data available for {selectedMonth ? format(selectedMonth, "MMMM yyyy") : "this period"}.</p>
            <Button variant="link" className="mt-2 text-primary" onClick={() => setSelectedMonth(undefined)}>Clear filter</Button>
          </div>
        </div>
      ) : (
        <PredictionChart
          data={filteredData}
          title={`Forecast: ${selectedStation.name}${selectedMonth ? ` · ${format(selectedMonth, "MMMM yyyy")}` : ""}`}
          subtitle={`${selectedStation.district}, ${selectedStation.state} · ${selectedMonth ? format(selectedMonth, "MMMM yyyy") + " view" : forecastDays + "-day LSTM prediction"}`}
        />
      )}

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-foreground mb-3">About the LSTM Model</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
          <div>
            <h4 className="font-semibold text-foreground mb-1">Architecture</h4>
            <p>2-layer LSTM with 64 hidden units, trained on 10+ years of DWLR time-series data with attention mechanism for seasonal pattern recognition.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Training Data</h4>
            <p>Trained on 10+ years of validated DWLR groundwater measurements across 5,260 stations, capturing seasonal and long-term trends.</p>
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
