import { useState } from "react";

// Marco común de cada gráfico: título, controles opcionales y una vista de tabla accesible
export default function ChartCard({ title, subtitle, controls, table, children, className = "" }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <section className={`panel chart-card ${className}`}>
      <div className="chart-card-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="chart-sub">{subtitle}</p>}
        </div>
        <div className="chart-controls">
          {controls}
          {table && (
            <button className="btn btn-sm btn-ghost" onClick={() => setShowTable((v) => !v)} aria-pressed={showTable}>
              {showTable ? "Gráfico" : "Tabla"}
            </button>
          )}
        </div>
      </div>
      {showTable && table ? (
        <div className="table-wrap chart-table">
          <table>
            <thead>
              <tr>
                {table.columns.map((c, i) => (
                  <th key={c} className={i ? "num" : ""}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={i} className={i ? "num" : ""}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </section>
  );
}
