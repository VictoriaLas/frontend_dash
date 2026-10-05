import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard.jsx";
import ChartTooltip, { axisProps } from "./ChartTooltip.jsx";
import Segmented from "../Segmented.jsx";
import { fmtGB } from "../../lib/format.js";

const METRICS = {
  ram: { label: "RAM", unit: (v) => fmtGB(v) },
  cores: { label: "Cores", unit: (v) => `${v} cores` },
  disk: { label: "Disco", unit: (v) => fmtGB(v) },
};

// Barras verticales: recursos asignados a cada VM, una métrica cada vez (escalas distintas)
export default function ResourcesBarChart({ vms }) {
  const [metric, setMetric] = useState("ram");
  const m = METRICS[metric];
  const data = [...vms].sort((a, b) => b[metric] - a[metric]).map((vm) => ({ name: vm.name, value: vm[metric] }));

  return (
    <ChartCard
      title="Recursos por VM"
      className="span-2"
      controls={<Segmented label="Métrica" value={metric} onChange={setMetric} options={Object.entries(METRICS).map(([k, v]) => [k, v.label])} />}
      table={{ columns: ["VM", m.label], rows: data.map((d) => [d.name, m.unit(d.value)]) }}
    >
      {data.length === 0 ? (
        <p className="empty">No hay VMs</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }} barCategoryGap="20%">
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 3" />
            <XAxis dataKey="name" {...axisProps} interval={0} angle={-35} textAnchor="end" height={70} />
            <YAxis {...axisProps} axisLine={false} width={56} allowDecimals={false} tickFormatter={metric === "cores" ? undefined : fmtGB} />
            <Tooltip cursor={{ fill: "var(--surface-2)" }} content={<ChartTooltip valueFormatter={m.unit} />} />
            <Bar dataKey="value" name={m.label} fill="var(--series-1)" radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
