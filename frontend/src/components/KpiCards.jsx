import { fmtGB } from "../lib/format.js";

// Totales de recursos asignados a las VMs activas (en ejecución) sobre el total
export default function KpiCards({ summary: s }) {
  const items = [
    ["VMs activas", s.running_vms, `de ${s.total_vms} VMs`],
    ["Cores", s.running_cores, `de ${s.total_cores} asignados`],
    ["RAM", fmtGB(s.running_ram), `de ${fmtGB(s.total_ram)} asignados`],
    ["Disco", fmtGB(s.running_disk), `de ${fmtGB(s.total_disk)} asignados`],
  ];
  return (
    <section className="kpis" aria-label="Resumen de VMs activas">
      {items.map(([label, value, sub]) => (
        <div className="kpi" key={label}>
          <span className="kpi-label">{label}</span>
          <span className="kpi-value">{value}</span>
          <span className="kpi-sub">{sub}</span>
        </div>
      ))}
    </section>
  );
}
