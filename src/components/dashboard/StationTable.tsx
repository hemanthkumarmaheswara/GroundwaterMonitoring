import { Station } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface StationTableProps {
  stations: Station[];
  limit?: number;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Normal: "secondary",
  Warning: "outline",
  Critical: "destructive",
};

export default function StationTable({ stations, limit }: StationTableProps) {
  const display = limit ? stations.slice(0, limit) : stations;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Station</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">State</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Level (mbgl)</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Trend</th>
            </tr>
          </thead>
          <tbody>
            {display.map(station => (
              <tr key={station.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/stations/${station.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                    {station.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">{station.id}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{station.state}</td>
                <td className="px-4 py-3 font-mono font-semibold">{station.level.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[station.status] || "default"} className={cn(
                    station.status === "Warning" && "border-warning text-warning",
                  )}>
                    {station.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex items-center gap-1 text-xs">
                    {station.trend === 'rising' && <ArrowUp className="h-3.5 w-3.5 text-destructive" />}
                    {station.trend === 'falling' && <ArrowDown className="h-3.5 w-3.5 text-success" />}
                    {station.trend === 'stable' && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span className="text-muted-foreground capitalize">{station.trend}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
