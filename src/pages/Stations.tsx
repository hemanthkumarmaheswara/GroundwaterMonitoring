import { useState, useMemo, useEffect } from "react";
import { useStations } from "@/hooks/useStations";
import StationTable from "@/components/dashboard/StationTable";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 50;

export default function Stations() {
  const { data: stations = [], isLoading } = useStations();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [page, setPage] = useState(1);

  const states = useMemo(() => {
    const unique = new Set<string>();
    stations.forEach(s => {
      if (s.state && s.state.trim()) unique.add(s.state);
    });
    return [...unique].sort();
  }, [stations]);

  const filtered = useMemo(() => {
    return stations.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchState = stateFilter === "all" || s.state === stateFilter;
      return matchSearch && matchStatus && matchState;
    });
  }, [stations, search, statusFilter, stateFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, stateFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) {
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
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">DWLR Stations</h1>
        <p className="text-muted-foreground mt-1">Browse and search all {stations.length.toLocaleString()} monitoring stations across India</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search stations, states, districts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Normal">Normal</SelectItem>
            <SelectItem value="Warning">Warning</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="State" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {states.map(state => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length.toLocaleString()} stations found</p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <StationTable stations={paginated} />
    </div>
  );
}
