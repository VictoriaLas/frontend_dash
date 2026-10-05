import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip, { axisProps } from "./ChartTooltip.jsx";
import Segmented from "../Segmented.jsx";
import { fmtTick, fmtTime } from "../../lib/format.js";

const SERIES = [
  { key: "cpu_percent", name: "CPU", color: "var(--series-1)" },
  { key: "ram_percent", name: "RAM", color: "var(--series-2)" },
  { key: "disk_percent", name: "Disco", color: "var(--series-3)" },
];

// Serie temporal de uso (%) de una VM: el mismo dato como área o como líneas
export default function MetricsChart({ points, range }) {
  const [kind, setKind] = useState("area");
  const Chart = kind === "area" ? AreaChart : LineChart;

  return (
    <div className="metrics">
      <div className="metrics-head">
        <span className="chart-sub">Uso en %</span>
        <Segmented label="Tipo de gráfico" value={kind} onChange={setKind} options={[["area", "Área"], ["line", "Líneas"]]} />
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <Chart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" {...axisProps} tickFormatter={(t) => fmtTick(t, range)} minTickGap={40} />
          <YAxis {...axisProps} axisLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} width={36} unit="%" />
          <Tooltip
            cursor={{ stroke: "var(--muted)", strokeDasharray: "3 3" }}
            content={<ChartTooltip labelFormatter={(t) => fmtTime(t, range)} valueFormatter={(v) => `${v} %`} />}
          />
          <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 13, color: "var(--muted)" }} />
          {SERIES.map((s) =>
            kind === "area" ? (
              <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} fill={s.color} fillOpacity={0.12} strokeWidth={2} dot={false} isAnimationActive={false} />
            ) : (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} />
            ),
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}
