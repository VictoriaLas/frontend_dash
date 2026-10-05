// Tooltip común para todos los gráficos de Recharts, con los colores del tema
export default function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter = (v) => v }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {label !== undefined && label !== "" && <div className="chart-tooltip-label">{labelFormatter ? labelFormatter(label) : label}</div>}
      {payload.map((p) => (
        <div className="chart-tooltip-row" key={p.dataKey ?? p.name}>
          <i className="swatch" style={{ background: p.payload?.fill ?? p.color }} />
          <span>{p.name}</span>
          <b>{valueFormatter(p.value, p)}</b>
        </div>
      ))}
    </div>
  );
}

// Props comunes de ejes y rejilla: recesivos, con la tinta del tema
export const axisProps = {
  stroke: "var(--line)",
  tick: { fill: "var(--muted)", fontSize: 12, fontFamily: "var(--font-data)" },
  tickLine: false,
};
