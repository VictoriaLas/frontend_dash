import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/client.js";
import Modal from "./Modal.jsx";
import Segmented from "./Segmented.jsx";
import StatusPill from "./StatusPill.jsx";
import MetricsChart from "./charts/MetricsChart.jsx";
import ChartTooltip, { axisProps } from "./charts/ChartTooltip.jsx";
import { fmtGB } from "../lib/format.js";

const RANGES = [
  ["1h", "1 h"],
  ["6h", "6 h"],
  ["24h", "24 h"],
  ["7d", "7 días"],
];

export default function VmDetailModal({ vm, isAdmin, onClose, onEdit }) {
  const [range, setRange] = useState("1h");
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setError("");
    api.metrics(vm.id, range).then(
      (m) => !cancelled && setMetrics(m),
      (e) => !cancelled && e.status !== 401 && setError(e.message),
    );
    return () => {
      cancelled = true;
    };
  }, [vm.id, vm.status, range]);

  const last = metrics?.points.at(-1);
  const current = last
    ? [
        { name: "CPU", value: last.cpu_percent, fill: "var(--series-1)" },
        { name: "RAM", value: last.ram_percent, fill: "var(--series-2)" },
        { name: "Disco", value: last.disk_percent, fill: "var(--series-3)" },
      ]
    : [];

  return (
    <Modal onClose={onClose} wide label={`Detalle de ${vm.name}`}>
      <div className="card-top">
        <h3>{vm.name}</h3>
        <StatusPill status={vm.status} />
      </div>
      <div className="specs">
        <div>
          <span>Cores</span>
          <b>{vm.cores}</b>
        </div>
        <div>
          <span>RAM</span>
          <b>{vm.ram} GB</b>
        </div>
        <div>
          <span>Disco</span>
          <b>{fmtGB(vm.disk)}</b>
        </div>
        <div>
          <span>Sistema</span>
          <b className="spec-text">{vm.os}</b>
        </div>
      </div>

      <div className="metrics-head">
        <h4>Uso de recursos</h4>
        <Segmented label="Rango de tiempo" value={range} onChange={setRange} options={RANGES} />
      </div>

      {error && <div className="error">{error}</div>}
      {metrics && (
        <>
          <MetricsChart points={metrics.points} range={metrics.range} />
          <div>
            <span className="chart-sub">Uso actual</span>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={current} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 0 }} barCategoryGap={6}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" width={56} {...axisProps} axisLine={false} />
                <Tooltip cursor={{ fill: "var(--surface-2)" }} content={<ChartTooltip valueFormatter={(v) => `${v} %`} />} />
                <Bar dataKey="value" name="Uso" radius={[0, 4, 4, 0]} background={{ fill: "var(--surface-2)", radius: 4 }} isAnimationActive={false}>
                  {current.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                  <LabelList dataKey="value" position="right" formatter={(v) => `${v} %`} fill="var(--fg)" fontSize={12} fontFamily="var(--font-data)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="kpi-sub">
            Métricas simuladas por el backend{vm.status !== "running" ? "; la VM no está en ejecución, por eso CPU y RAM están a 0" : ""}.
          </p>
        </>
      )}

      <div className="modal-actions">
        {isAdmin && (
          <button className="btn" onClick={onEdit}>
            Editar
          </button>
        )}
        <button className="btn btn-primary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
