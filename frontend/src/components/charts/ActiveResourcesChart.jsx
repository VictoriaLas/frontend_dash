import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartCard from "./ChartCard.jsx";
import ChartTooltip from "./ChartTooltip.jsx";
import { fmtGB, pct } from "../../lib/format.js";

// Barras radiales: suma de cores, RAM y disco de las VMs activas, como % del total asignado.
// Cada recurso tiene su propia unidad, por eso se comparan en % y el valor absoluto va en la leyenda.
export default function ActiveResourcesChart({ summary: s }) {
  const data = [
    { name: "Disco", value: pct(s.running_disk, s.total_disk), detail: `${fmtGB(s.running_disk)} de ${fmtGB(s.total_disk)}`, fill: "var(--series-3)" },
    { name: "RAM", value: pct(s.running_ram, s.total_ram), detail: `${fmtGB(s.running_ram)} de ${fmtGB(s.total_ram)}`, fill: "var(--series-2)" },
    { name: "Cores", value: pct(s.running_cores, s.total_cores), detail: `${s.running_cores} de ${s.total_cores}`, fill: "var(--series-1)" },
  ];

  return (
    <ChartCard
      title="Recursos de las VMs activas"
      subtitle={`Suma de ${s.running_vms} VMs en ejecución sobre el total asignado`}
      table={{ columns: ["Recurso", "VMs activas", "%"], rows: [...data].reverse().map((d) => [d.name, d.detail, `${d.value} %`]) }}
    >
      <div className="donut">
        <div className="donut-chart">
          <ResponsiveContainer width="100%" height={210}>
            <RadialBarChart data={data} innerRadius="38%" outerRadius="100%" startAngle={90} endAngle={-270} barSize={14}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
              <RadialBar dataKey="value" background={{ fill: "var(--surface-2)" }} cornerRadius={7} />
              <Tooltip cursor={false} content={<ChartTooltip valueFormatter={(v, p) => `${v} % · ${p.payload.detail}`} />} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <ul className="legend legend-col">
          {[...data].reverse().map((d) => (
            <li key={d.name}>
              <i className="dot" style={{ background: d.fill }} />
              {d.name}
              <b>{d.value} %</b>
              <span className="legend-detail">{d.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}
