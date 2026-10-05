import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard.jsx";
import ChartTooltip, { axisProps } from "./ChartTooltip.jsx";

// Barras horizontales: cuántas VMs hay de cada sistema operativo
export default function OsBarChart({ summary }) {
  const data = Object.entries(summary.by_os ?? {}).map(([name, value]) => ({ name, value }));
  const height = Math.max(160, data.length * 36 + 20);

  return (
    <ChartCard title="VMs por sistema operativo" table={{ columns: ["Sistema", "VMs"], rows: data.map((d) => [d.name, d.value]) }}>
      {data.length === 0 ? (
        <p className="empty">Sin datos</p>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 0 }} barCategoryGap={8}>
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={140} {...axisProps} axisLine={false} tick={{ ...axisProps.tick, fontFamily: "var(--font-ui)" }} />
            <Tooltip cursor={{ fill: "var(--surface-2)" }} content={<ChartTooltip valueFormatter={(v) => `${v} VMs`} />} />
            <Bar dataKey="value" name="VMs" fill="var(--series-1)" radius={[0, 4, 4, 0]} maxBarSize={22}>
              <LabelList dataKey="value" position="right" fill="var(--fg)" fontSize={12} fontFamily="var(--font-data)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
