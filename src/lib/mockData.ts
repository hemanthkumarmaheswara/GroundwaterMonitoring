export interface Station {
  id: string;
  name: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  level: number;
  status: 'Normal' | 'Warning' | 'Critical';
  trend: 'rising' | 'falling' | 'stable';
  stationType: string;
  lastUpdate: string;
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

const INDIAN_STATIONS_DATA = [
  { name: "Kurnool AWS", state: "Andhra Pradesh", district: "Kurnool", lat: 15.7506, lng: 78.0668, type: "SURFACE" },
  { name: "Gandigunta AWS", state: "Andhra Pradesh", district: "Krishna", lat: 16.3814, lng: 80.853, type: "SURFACE" },
  { name: "Vaticherla", state: "Andhra Pradesh", district: "Prakasam", lat: 15.461, lng: 79.3716, type: "GROUND" },
  { name: "Gurvajipeta", state: "Andhra Pradesh", district: "Prakasam", lat: 15.2347, lng: 79.4, type: "GROUND" },
  { name: "Allinagaram", state: "Andhra Pradesh", district: "Prakasam", lat: 15.6483, lng: 79.1086, type: "GROUND" },
  { name: "Dharmavaram", state: "Andhra Pradesh", district: "Srikakulam", lat: 18.2148, lng: 83.8998, type: "GROUND" },
  { name: "Thummapala", state: "Andhra Pradesh", district: "Visakhapatnam", lat: 17.709, lng: 82.9987, type: "GROUND" },
  { name: "Bhimili", state: "Andhra Pradesh", district: "Visakhapatnam", lat: 17.8839, lng: 83.4474, type: "GROUND" },
  { name: "Jaipur Central", state: "Rajasthan", district: "Jaipur", lat: 26.9124, lng: 75.7873, type: "GROUND" },
  { name: "Jodhpur West", state: "Rajasthan", district: "Jodhpur", lat: 26.2389, lng: 73.0243, type: "GROUND" },
  { name: "Udaipur Lake", state: "Rajasthan", district: "Udaipur", lat: 24.5854, lng: 73.7125, type: "GROUND" },
  { name: "Bikaner North", state: "Rajasthan", district: "Bikaner", lat: 28.0229, lng: 73.3119, type: "GROUND" },
  { name: "Nagpur Central", state: "Maharashtra", district: "Nagpur", lat: 21.1458, lng: 79.0882, type: "GROUND" },
  { name: "Pune Station", state: "Maharashtra", district: "Pune", lat: 18.5204, lng: 73.8567, type: "GROUND" },
  { name: "Nashik Valley", state: "Maharashtra", district: "Nashik", lat: 19.9975, lng: 73.7898, type: "GROUND" },
  { name: "Aurangabad", state: "Maharashtra", district: "Aurangabad", lat: 19.8762, lng: 75.3433, type: "GROUND" },
  { name: "Chennai Metro", state: "Tamil Nadu", district: "Chennai", lat: 13.0827, lng: 80.2707, type: "GROUND" },
  { name: "Coimbatore", state: "Tamil Nadu", district: "Coimbatore", lat: 11.0168, lng: 76.9558, type: "GROUND" },
  { name: "Madurai South", state: "Tamil Nadu", district: "Madurai", lat: 9.9252, lng: 78.1198, type: "GROUND" },
  { name: "Salem Hills", state: "Tamil Nadu", district: "Salem", lat: 11.6643, lng: 78.146, type: "GROUND" },
  { name: "Lucknow Central", state: "Uttar Pradesh", district: "Lucknow", lat: 26.8467, lng: 80.9462, type: "GROUND" },
  { name: "Varanasi Ghat", state: "Uttar Pradesh", district: "Varanasi", lat: 25.3176, lng: 82.9739, type: "GROUND" },
  { name: "Agra Fort", state: "Uttar Pradesh", district: "Agra", lat: 27.1767, lng: 78.0081, type: "GROUND" },
  { name: "Kanpur Industrial", state: "Uttar Pradesh", district: "Kanpur", lat: 26.4499, lng: 80.3319, type: "GROUND" },
  { name: "Kolkata Central", state: "West Bengal", district: "Kolkata", lat: 22.5726, lng: 88.3639, type: "GROUND" },
  { name: "Siliguri North", state: "West Bengal", district: "Darjeeling", lat: 26.7271, lng: 88.3953, type: "GROUND" },
  { name: "Patna Central", state: "Bihar", district: "Patna", lat: 25.6093, lng: 85.1376, type: "GROUND" },
  { name: "Gaya South", state: "Bihar", district: "Gaya", lat: 24.7914, lng: 84.9994, type: "GROUND" },
  { name: "Bhopal Lake", state: "Madhya Pradesh", district: "Bhopal", lat: 23.2599, lng: 77.4126, type: "GROUND" },
  { name: "Indore City", state: "Madhya Pradesh", district: "Indore", lat: 22.7196, lng: 75.8577, type: "GROUND" },
  { name: "Bengaluru Urban", state: "Karnataka", district: "Bengaluru", lat: 12.9716, lng: 77.5946, type: "GROUND" },
  { name: "Mysore Palace", state: "Karnataka", district: "Mysore", lat: 12.2958, lng: 76.6394, type: "GROUND" },
  { name: "Hubli North", state: "Karnataka", district: "Dharwad", lat: 15.3647, lng: 75.124, type: "GROUND" },
  { name: "Ahmedabad City", state: "Gujarat", district: "Ahmedabad", lat: 23.0225, lng: 72.5714, type: "GROUND" },
  { name: "Surat Port", state: "Gujarat", district: "Surat", lat: 21.1702, lng: 72.8311, type: "GROUND" },
  { name: "Rajkot Central", state: "Gujarat", district: "Rajkot", lat: 22.3039, lng: 70.8022, type: "GROUND" },
  { name: "Raipur Central", state: "Chhattisgarh", district: "Raipur", lat: 21.2514, lng: 81.6296, type: "GROUND" },
  { name: "Ranchi Hills", state: "Jharkhand", district: "Ranchi", lat: 23.3441, lng: 85.3096, type: "GROUND" },
  { name: "Bhubaneswar", state: "Odisha", district: "Khordha", lat: 20.2961, lng: 85.8245, type: "GROUND" },
  { name: "Cuttack Old", state: "Odisha", district: "Cuttack", lat: 20.4625, lng: 85.8828, type: "GROUND" },
  { name: "Hyderabad Metro", state: "Telangana", district: "Hyderabad", lat: 17.385, lng: 78.4867, type: "GROUND" },
  { name: "Warangal Fort", state: "Telangana", district: "Warangal", lat: 17.9784, lng: 79.5941, type: "GROUND" },
  { name: "Kochi Port", state: "Kerala", district: "Ernakulam", lat: 9.9312, lng: 76.2673, type: "GROUND" },
  { name: "Trivandrum", state: "Kerala", district: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366, type: "GROUND" },
  { name: "Chandigarh Sec17", state: "Punjab", district: "Chandigarh", lat: 30.7333, lng: 76.7794, type: "GROUND" },
  { name: "Amritsar Golden", state: "Punjab", district: "Amritsar", lat: 31.634, lng: 74.8723, type: "GROUND" },
  { name: "Dehradun Valley", state: "Uttarakhand", district: "Dehradun", lat: 30.3165, lng: 78.0322, type: "GROUND" },
  { name: "Shimla Hills", state: "Himachal Pradesh", district: "Shimla", lat: 31.1048, lng: 77.1734, type: "GROUND" },
  { name: "Guwahati River", state: "Assam", district: "Kamrup", lat: 26.1445, lng: 91.7362, type: "GROUND" },
  { name: "Imphal Valley", state: "Manipur", district: "Imphal", lat: 24.817, lng: 93.9368, type: "GROUND" },
];

function generateStations(): Station[] {
  return INDIAN_STATIONS_DATA.map((s, i) => {
    const id = `DWLR-${1000 + i}`;
    const rand = seededRandom(id + 'level');
    const trendRand = seededRandom(id + 'trend');
    const level = parseFloat((5 + rand * 45).toFixed(2));

    let status: Station['status'] = 'Normal';
    if (level > 35) status = 'Critical';
    else if (level > 20) status = 'Warning';

    const trend: Station['trend'] = trendRand > 0.6 ? 'rising' : trendRand > 0.3 ? 'falling' : 'stable';

    return {
      id,
      name: s.name,
      state: s.state,
      district: s.district,
      lat: s.lat,
      lng: s.lng,
      level,
      status,
      trend,
      stationType: s.type,
      lastUpdate: new Date().toISOString(),
    };
  });
}

export const MOCK_STATIONS = generateStations();

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

export function getStateStats() {
  const stations = MOCK_STATIONS;
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
