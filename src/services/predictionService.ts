export interface PredictionPoint {
  date: string;
  dateObj: Date;
  level: number;
  type: 'Historical' | 'Predicted' | 'Synthetic';
  confidenceLow?: number;
  confidenceHigh?: number;
}

function stationBaseLevel(stationId: string): number {
  let hash = 0;
  for (let i = 0; i < stationId.length; i++) {
    const char = stationId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const x = Math.sin(hash) * 10000;
  const rand = x - Math.floor(x);
  return parseFloat((5 + rand * 40).toFixed(2));
}

// Generate predictions for a wide window (365 days ahead + 90 days history)
export async function getStationPrediction(stationId: string, days = 30): Promise<PredictionPoint[]> {
  await new Promise(resolve => setTimeout(resolve, 600));

  const history = generateMockHistory(stationId, 90);
  const predictions: PredictionPoint[] = [];

  const startDayIndex = 91;
  const baseLevel = stationBaseLevel(stationId);

  // Always generate a full year of predictions regardless of `days`
  // so we can filter client-side by month
  for (let i = 1; i <= 365; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayIndex = startDayIndex + i;

    const trendComponent = dayIndex * 0.015;
    const seasonalComponent = Math.sin((dayIndex / 365) * 2 * Math.PI) * 2;
    const noise = (Math.sin(dayIndex * 13.7) * 0.5 - 0.25) * 0.2;

    const predictedLevel = baseLevel + trendComponent + seasonalComponent + noise;
    const uncertainty = 0.3 + (i / 365) * 2.0;

    predictions.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateObj: new Date(date),
      level: parseFloat(predictedLevel.toFixed(2)),
      type: 'Predicted',
      confidenceLow: parseFloat((predictedLevel - uncertainty).toFixed(2)),
      confidenceHigh: parseFloat((predictedLevel + uncertainty).toFixed(2)),
    });
  }

  return [...history, ...predictions];
}

export async function getSyntheticData(stationId: string): Promise<PredictionPoint[]> {
  await new Promise(resolve => setTimeout(resolve, 400));

  const data: PredictionPoint[] = [];
  const baseLevel = 18;

  for (let year = 2015; year <= 2024; year++) {
    for (let month = 0; month < 12; month++) {
      const date = new Date(year, month, 15);
      const yearOffset = (year - 2015) * 0.3;
      const seasonal = Math.sin((month / 12) * 2 * Math.PI) * 4;
      const noise = Math.sin(year * 7 + month * 3) * 0.8;

      const isMissing = (year === 2017 || year === 2019 || year === 2021);

      data.push({
        date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        dateObj: new Date(date),
        level: parseFloat((baseLevel + yearOffset + seasonal + noise).toFixed(2)),
        type: isMissing ? 'Synthetic' : 'Historical',
      });
    }
  }

  return data;
}

function generateMockHistory(stationId: string, days: number): PredictionPoint[] {
  const data: PredictionPoint[] = [];
  const now = new Date();
  const baseLevel = stationBaseLevel(stationId);

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayIndex = days - i;
    const trendComponent = dayIndex * 0.02;
    const seasonalComponent = Math.sin((dayIndex / 365) * 2 * Math.PI) * 2;
    const noise = (Math.sin(dayIndex * 7.3) * 0.5 - 0.25) * 0.15;

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateObj: new Date(date),
      level: parseFloat((baseLevel + trendComponent + seasonalComponent + noise).toFixed(2)),
      type: 'Historical',
    });
  }
  return data;
}
