import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartCard from "./ChartCard.jsx";
import ChartTooltip from "./ChartTooltip.jsx";
import { STATUSES, STATUS_COLOR, STATUS_LABEL, pct } from "../../lib/format.js";

// Gráfico de dona: reparto de VMs por estado
export default function StatusDonut({ summary }) {
  const total = summary.total_vms;
  const data = STATUSES.map((s) => ({ key: s, name: STATUS_LABEL[s], value: summary.by_status[s] ?? 0, fill: STATUS_COLOR[s] }));
  const visible = data.filter((d) => d.value > 0);

  return (
    <ChartCard title="Estado de las VMs" table={{ columns: ["Estado", "VMs", "%"], rows: data.map((d) => [d.name, d.value, `${pct(d.value, total)} %`]) }}>
      <div className="donut">
        <div className="donut-chart">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={visible} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={visible.length > 1 ? 2 : 0} stroke="var(--surface)" strokeWidth={2} />
              <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v} VMs (${pct(v, total)} %)`} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center" aria-hidden="true">
            <b>{total}</b>
            <span>VMs</span>
          </div>
        </div>
        <ul className="legend legend-col">
          {data.map((d) => (
            <li key={d.key}>
              <i className="dot" style={{ background: d.fill }} />
              {d.name}
              <b>{d.value}</b>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}
