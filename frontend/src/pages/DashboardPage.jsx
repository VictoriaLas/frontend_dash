import { Link } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { useVms } from "../context/VmsContext.jsx";
import KpiCards from "../components/KpiCards.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import { ChartSkeleton, KpiSkeleton } from "../components/Skeleton.jsx";
import ActiveResourcesChart from "../components/charts/ActiveResourcesChart.jsx";
import StatusDonut from "../components/charts/StatusDonut.jsx";
import OsBarChart from "../components/charts/OsBarChart.jsx";
import ResourcesBarChart from "../components/charts/ResourcesBarChart.jsx";

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { status, items, summary, error, reload } = useVms();

  return (
    <>
      <div className="page-head">
        <h1>Dashboard</h1>
      </div>
      {status === "error" ? (
        <ErrorState message={error} onRetry={reload} />
      ) : status !== "ready" ? (
        <>
          <KpiSkeleton />
          <div className="chart-grid">
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton className="span-2" />
          </div>
        </>
      ) : items.length === 0 ? (
        <EmptyState
          title="Aún no hay máquinas virtuales"
          action={
            isAdmin && (
              <Link className="btn btn-primary" to="/vms/new">
                Crear la primera VM
              </Link>
            )
          }
        >
          Cuando haya VMs verás aquí el uso de recursos y su estado.
        </EmptyState>
      ) : (
        <>
          <KpiCards summary={summary} />
          <div className="chart-grid">
            <ActiveResourcesChart summary={summary} />
            <StatusDonut summary={summary} />
            <OsBarChart summary={summary} />
            <ResourcesBarChart vms={items} />
          </div>
        </>
      )}
    </>
  );
}
