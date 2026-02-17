import { useMemo, useRef, useEffect, useState } from "react";
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ReferenceDot } from "recharts";
import { PredictionPoint } from "@/services/predictionService";

interface PredictionChartProps {
  data: PredictionPoint[];
  title?: string;
  subtitle?: string;
}

export default function PredictionChart({ data, title = "Groundwater Level Forecast (30 Days)", subtitle = "Historical Data vs LSTM Model Prediction" }: PredictionChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const chartData = useMemo(() => {
    let lastHistoryIndex = -1;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].type === 'Historical') { lastHistoryIndex = i; break; }
    }
    return data.map((point, index) => ({
      date: point.date,
      historicalLevel: point.type === 'Historical' ? point.level : null,
      predictedLevel: point.type === 'Predicted' || index === lastHistoryIndex ? point.level : null,
      syntheticLevel: null,
      confidenceHigh: point.type === 'Predicted' ? point.confidenceHigh : null,
      confidenceLow: point.type === 'Predicted' ? point.confidenceLow : null,
    }));
  }, [data]);

  const splitPoint = useMemo(() => data.filter(d => d.type === 'Historical').pop(), [data]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) setWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h3 className="text-lg font-display font-bold text-card-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {splitPoint && (
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Current Level</p>
            <p className="text-2xl font-display font-bold text-primary">{splitPoint.level.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">mbgl</span></p>
          </div>
        )}
      </div>
      <div ref={containerRef} className="w-full h-[350px]">
        {width > 0 && (
          <ComposedChart width={width} height={350} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 32%, 91%)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} interval="preserveStartEnd" minTickGap={40} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} tickLine={false} axisLine={false} label={{ value: 'Depth (mbgl)', angle: -90, position: 'insideLeft', fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214, 32%, 91%)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
            {splitPoint && <ReferenceLine x={splitPoint.date} stroke="hsl(215, 16%, 47%)" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />}
            <Area type="monotone" dataKey="confidenceHigh" stroke="none" fill="url(#colorConfidence)" name="95% Confidence" connectNulls />
            <Line type="monotone" dataKey="historicalLevel" stroke="hsl(199, 89%, 48%)" strokeWidth={3} dot={{ r: 3, fill: 'hsl(199, 89%, 48%)', strokeWidth: 0 }} name="Historical" connectNulls />
            <Line type="monotone" dataKey="predictedLevel" stroke="hsl(38, 92%, 50%)" strokeWidth={3} strokeDasharray="4 4" dot={{ stroke: 'hsl(38, 92%, 50%)', strokeWidth: 2, r: 3, fill: 'white' }} name="LSTM Forecast" connectNulls />
            
            {splitPoint && <ReferenceDot x={splitPoint.date} y={splitPoint.level} r={6} fill="hsl(199, 89%, 48%)" stroke="white" strokeWidth={2} />}
          </ComposedChart>
        )}
      </div>
    </div>
  );
}
