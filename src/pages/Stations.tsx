import { useState, useMemo } from "react";
import { MOCK_STATIONS } from "@/lib/mockData";
import StationTable from "@/components/dashboard/StationTable";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Stations() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");

  const states = useMemo(() => [...new Set(MOCK_STATIONS.map(s => s.state))].sort(), []);

  const filtered = useMemo(() => {
    return MOCK_STATIONS.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.state.toLowerCase().includes(search.toLowerCase()) ||
        s.district.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchState = stateFilter === "all" || s.state === stateFilter;
      return matchSearch && matchStatus && matchState;
    });
  }, [search, statusFilter, stateFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">DWLR Stations</h1>
        <p className="text-muted-foreground mt-1">Browse and search all monitoring stations across India</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stations, states, districts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Normal">Normal</SelectItem>
            <SelectItem value="Warning">Warning</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {states.map(state => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} stations found</p>
      <StationTable stations={filtered} />
    </div>
  );
}
