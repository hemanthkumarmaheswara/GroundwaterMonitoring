import { useQuery } from "@tanstack/react-query";
import { fetchStations } from "@/lib/mockData";

export function useStations() {
  return useQuery({
    queryKey: ["stations"],
    queryFn: fetchStations,
    staleTime: Infinity,
  });
}
