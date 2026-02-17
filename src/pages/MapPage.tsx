import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useStations } from "@/hooks/useStations";
import { Station } from "@/lib/mockData";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const statusColors: Record<string, string> = {
  Normal: "#22c55e",
  Warning: "#f59e0b",
  Critical: "#ef4444",
};

function createStationIcon(status: string) {
  const color = statusColors[status] || "#3b82f6";
  return L.divIcon({
    html: `<div style="
      width:12px;height:12px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

export default function MapPage() {
  const { data: stations = [], isLoading } = useStations();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const clusterGroupRef = useRef<any>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const filtered = useMemo(() => {
    let result = stations;
    if (statusFilter !== "all") result = result.filter(s => s.status === statusFilter);
    return result;
  }, [stations, statusFilter]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return stations
      .filter(s => s.name.toLowerCase().includes(q) || s.district?.toLowerCase().includes(q) || s.state?.toLowerCase().includes(q))
      .slice(0, 50);
  }, [stations, searchQuery]);

  const handleSelectSearchResult = useCallback((station: Station) => {
    const map = mapRef.current;
    if (map && station.lat && station.lng) {
      map.setView([station.lat, station.lng], 14, { animate: true });
      setSelectedStation(station);
    }
    setShowResults(false);
    setSearchQuery("");
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.5, 82],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when stations/filter change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || filtered.length === 0) return;

    // Remove existing cluster group
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    const clusterGroup = (L as any).markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      chunkedLoading: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = "small";
        let dim = 30;
        if (count > 100) { size = "large"; dim = 44; }
        else if (count > 10) { size = "medium"; dim = 36; }

        return L.divIcon({
          html: `<div style="
            width:${dim}px;height:${dim}px;border-radius:50%;
            background:hsl(199, 89%, 48%);color:white;
            display:flex;align-items:center;justify-content:center;
            font-size:${size === 'large' ? 13 : size === 'medium' ? 12 : 11}px;
            font-weight:700;border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
          ">${count}</div>`,
          className: "",
          iconSize: [dim, dim],
          iconAnchor: [dim / 2, dim / 2],
        });
      },
    });

    const markers: L.Marker[] = [];
    filtered.forEach(station => {
      if (!station.lat || !station.lng) return;
      const marker = L.marker([station.lat, station.lng], {
        icon: createStationIcon(station.status),
      });
      marker.on("click", () => setSelectedStation(station));
      markers.push(marker);
    });

    clusterGroup.addLayers(markers);
    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;
  }, [filtered]);

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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Station Map</h1>
          <p className="text-muted-foreground mt-1">{filtered.length.toLocaleString()} DWLR stations visualized across India</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-success" />Normal</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-warning" />Warning</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-destructive" />Critical</span>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Warning">Warning</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-border">
        {/* Search overlay */}
        <div className="absolute top-3 left-3 z-[1000] w-72">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search station, district, state..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              className="pl-9 pr-8 bg-card/95 backdrop-blur-sm border-border shadow-lg text-sm"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setShowResults(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          {showResults && searchResults.length > 0 && (
            <div className="mt-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
              {searchResults.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSearchResult(s)}
                  className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-accent/50 transition-colors text-sm border-b border-border/50 last:border-0"
                >
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: statusColors[s.status] || "#3b82f6" }} />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.district}, {s.state}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {showResults && searchQuery.trim() && searchResults.length === 0 && (
            <div className="mt-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-3 text-sm text-muted-foreground text-center">
              No stations found
            </div>
          )}
        </div>
        <div ref={mapContainerRef} className="h-[calc(100vh-220px)] min-h-[500px] w-full z-0" />

        {/* Station info popup */}
        {selectedStation && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-card border border-border rounded-xl shadow-xl p-4 z-[1000]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-bold text-foreground">{selectedStation.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedStation.district}, {selectedStation.state}</p>
              </div>
              <Badge variant={selectedStation.status === 'Critical' ? 'destructive' : selectedStation.status === 'Warning' ? 'outline' : 'secondary'}>
                {selectedStation.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Water Level</p>
                <p className="font-mono font-semibold">{selectedStation.level.toFixed(2)} m</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Station Type</p>
                <p className="font-semibold">{selectedStation.stationType}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Coordinates</p>
                <p className="font-mono text-xs">{selectedStation.lat.toFixed(4)}°N, {selectedStation.lng.toFixed(4)}°E</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Trend</p>
                <p className="font-semibold capitalize">{selectedStation.trend}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Link
                to={`/stations/${selectedStation.id}`}
                className="flex-1 text-center text-xs font-medium py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                View Details
              </Link>
              <button
                onClick={() => setSelectedStation(null)}
                className="text-xs font-medium py-2 px-3 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
