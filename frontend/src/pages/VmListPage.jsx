import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { useVms } from "../context/VmsContext.jsx";
import VmTable from "../components/VmTable.jsx";
import VmDetailModal from "../components/VmDetailModal.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import { TableSkeleton } from "../components/Skeleton.jsx";
import { STATUSES, STATUS_LABEL } from "../lib/format.js";

export default function VmListPage() {
  const { isAdmin } = useAuth();
  const { status: loadStatus, items, flash, error, reload } = useVms();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((v) => (!status || v.status === status) && (!q || v.name.toLowerCase().includes(q) || v.os.toLowerCase().includes(q)));
  }, [items, search, status]);
  // El detalle sigue a la VM del estado global, así refleja cambios en tiempo real
  const detail = items.find((v) => v.id === detailId);
  const filtered = search || status;

  let body;
  if (loadStatus === "error") body = <ErrorState message={error} onRetry={reload} />;
  else if (loadStatus !== "ready") body = <TableSkeleton />;
  else if (items.length === 0)
    body = (
      <EmptyState
        title="No hay máquinas virtuales"
        action={
          isAdmin && (
            <Link className="btn btn-primary" to="/vms/new">
              + Nueva VM
            </Link>
          )
        }
      >
        {isAdmin ? "Crea la primera para empezar." : "Un Administrador todavía no ha creado ninguna."}
      </EmptyState>
    );
  else if (list.length === 0)
    body = (
      <EmptyState
        icon="search"
        title="Ninguna VM coincide con el filtro"
        action={
          <button className="btn" onClick={() => (setSearch(""), setStatus(""))}>
            Limpiar filtros
          </button>
        }
      />
    );
  else
    body = (
      <VmTable
        vms={list}
        isAdmin={isAdmin}
        flash={flash}
        onOpen={(vm) => setDetailId(vm.id)}
        onEdit={(vm) => navigate(`/vms/${vm.id}/edit`)}
        onDelete={setDeleting}
      />
    );

  return (
    <>
      <div className="page-head">
        <h1>Máquinas virtuales</h1>
        {/* Para un Cliente estos botones no se renderizan (no basta con deshabilitarlos) */}
        {isAdmin && (
          <Link className="btn btn-primary" to="/vms/new">
            + Nueva VM
          </Link>
        )}
      </div>
      <section className="panel">
        <div className="panel-head">
          <span className="muted">{loadStatus === "ready" ? `${list.length} de ${items.length} VMs${filtered ? " (filtradas)" : ""}` : "Cargando…"}</span>
          <div className="filters">
            <input type="search" placeholder="Buscar por nombre o sistema" aria-label="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select aria-label="Filtrar por estado" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos los estados</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {body}
      </section>

      {detail && (
        <VmDetailModal
          vm={detail}
          isAdmin={isAdmin}
          onClose={() => setDetailId(null)}
          onEdit={() => navigate(`/vms/${detail.id}/edit`)}
        />
      )}
      {deleting && <ConfirmDeleteModal vm={deleting} onClose={() => setDeleting(null)} />}
    </>
  );
}
