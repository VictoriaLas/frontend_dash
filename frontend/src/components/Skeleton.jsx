// Bloques de carga con el contorno del contenido que va a aparecer
export function Skeleton({ width = "100%", height = 14, radius = 6, className = "" }) {
  return <span className={`skeleton ${className}`} style={{ width, height, borderRadius: radius }} aria-hidden="true" />;
}

export function KpiSkeleton() {
  return (
    <section className="kpis" aria-busy="true" aria-label="Cargando resumen">
      {[0, 1, 2, 3].map((i) => (
        <div className="kpi" key={i}>
          <Skeleton width="40%" height={12} />
          <Skeleton width="60%" height={28} />
          <Skeleton width="50%" height={12} />
        </div>
      ))}
    </section>
  );
}

export function ChartSkeleton({ height = 220, className = "" }) {
  return (
    <section className={`panel chart-card ${className}`} aria-busy="true">
      <Skeleton width="45%" height={16} />
      <Skeleton height={height} radius={8} />
    </section>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="table-skeleton" aria-busy="true" aria-label="Cargando máquinas virtuales">
      {Array.from({ length: rows }, (_, i) => (
        <div className="table-skeleton-row" key={i}>
          <Skeleton width="22%" />
          <Skeleton width="18%" />
          <Skeleton width="12%" height={20} radius={999} />
          <Skeleton width="8%" />
          <Skeleton width="10%" />
          <Skeleton width="10%" />
        </div>
      ))}
    </div>
  );
}
