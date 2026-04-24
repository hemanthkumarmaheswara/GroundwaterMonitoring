export interface Station {
  id: string;
  name: string;
  state: string;
  district: string;
  tahsil: string;
  lat: number;
  lng: number;
  level: number;
  status: 'Normal' | 'Warning' | 'Critical';
  trend: 'rising' | 'falling' | 'stable';
  stationType: string;
  stationStatus: string;
  agencyName: string;
  lastUpdate: string;
}

interface RawStation {
  Agency_Name: string;
  State_Name: string;
  District_Name: string;
  Tahsil_Name: string;
  Station_Name: string;
  Latitude: number;
  Longitude: number;
  Station_Type: string;
  Station_Status: string;
}

function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

function toTitleCase(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function transformStation(raw: RawStation, index: number): Station {
  const id = `DWLR-${String(index + 1).padStart(4, '0')}`;
  const rand = seededRandom(id + 'level');
  const trendRand = seededRandom(id + 'trend');
  const level = parseFloat((5 + rand * 45).toFixed(2));

  let status: Station['status'] = 'Normal';
  if (level > 35) status = 'Critical';
  else if (level > 20) status = 'Warning';

  const trend: Station['trend'] = trendRand > 0.6 ? 'rising' : trendRand > 0.3 ? 'falling' : 'stable';

  return {
    id,
    name: toTitleCase(raw.Station_Name || ''),
    state: toTitleCase(raw.State_Name || ''),
    district: toTitleCase(raw.District_Name || ''),
    tahsil: toTitleCase(raw.Tahsil_Name || ''),
    lat: raw.Latitude || 0,
    lng: raw.Longitude || 0,
    level,
    status,
    trend,
    stationType: raw.Station_Type || 'GROUND',
    stationStatus: raw.Station_Status || 'INSTALLED',
    agencyName: raw.Agency_Name || '',
    lastUpdate: new Date().toISOString(),
  };
}

export async function fetchStations(): Promise<Station[]> {
  console.log('[fetchStations] Starting fetch...');
  const res = await fetch('/data/stations.json');
  if (!res.ok) {
    throw new Error(`Failed to fetch stations: ${res.status}`);
  }
  const json = await res.json();
  console.log('[fetchStations] JSON parsed, Table length:', json.Table?.length);
  const rawStations = json.Table as RawStation[];
  if (!rawStations || !Array.isArray(rawStations)) {
    throw new Error('Invalid stations data format');
  }
  // Filter out entries with missing critical fields or invalid coordinates
  const validStations = rawStations.filter(s => 
    s.Station_Name && s.Station_Name.trim() && 
    s.State_Name && s.State_Name.trim() &&
    s.Latitude && s.Longitude &&
    // India's bounding box (lat: 6-37, lng: 68-98)
    s.Latitude >= 6 && s.Latitude <= 37 && 
    s.Longitude >= 68 && s.Longitude <= 98
  );
  const stations = validStations.map(transformStation);
  console.log('[fetchStations] Validated stations in box:', stations.length);
  return stations;
}

// Keep for backwards compat
export const MOCK_STATIONS: Station[] = [];

export function generateHistoricalData() {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const baseLevel = 15;
    const randomFluctuation = Math.sin(i * 0.5) * 3 + Math.cos(i * 0.3) * 1.5;
    const seasonalTrend = Math.sin(i / 10) * 2;
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      level: parseFloat((baseLevel + seasonalTrend + randomFluctuation).toFixed(2)),
    });
  }
  return data;
}

export function getStateStats(stations: Station[]) {
  const stateMap = new Map<string, { total: number; critical: number; warning: number; normal: number; avgLevel: number }>();

  stations.forEach(s => {
    const existing = stateMap.get(s.state) || { total: 0, critical: 0, warning: 0, normal: 0, avgLevel: 0 };
    existing.total++;
    if (s.status === 'Critical') existing.critical++;
    else if (s.status === 'Warning') existing.warning++;
    else existing.normal++;
    existing.avgLevel += s.level;
    stateMap.set(s.state, existing);
  });

  return Array.from(stateMap.entries()).map(([state, data]) => ({
    state,
    ...data,
    avgLevel: parseFloat((data.avgLevel / data.total).toFixed(2)),
  })).sort((a, b) => b.total - a.total);
}
