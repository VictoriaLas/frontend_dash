import StatusPill from "./StatusPill.jsx";
import { fmtGB } from "../lib/format.js";

// Tabla en pantallas anchas y tarjetas en móvil/tablet. `flash` resalta las VMs que
// acaban de cambiar en tiempo real; `pending` marca las que esperan respuesta del servidor.
export default function VmTable({ vms, isAdmin, flash, onOpen, onEdit, onDelete }) {
  const rowClass = (vm) => ["clickable", flash[vm.id] && "flash", vm.pending && "pending"].filter(Boolean).join(" ");
  const actions = (vm) => (
    <div className="actions">
      <button className="btn btn-sm" disabled={vm.pending} onClick={(e) => (e.stopPropagation(), onEdit(vm))}>
        Editar
      </button>
      <button className="btn btn-sm btn-danger" disabled={vm.pending} onClick={(e) => (e.stopPropagation(), onDelete(vm))}>
        Borrar
      </button>
    </div>
  );
  const open = (vm) => !vm.pending && onOpen(vm);
  const onKey = (vm) => (e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && (e.preventDefault(), open(vm));

  return (
    <>
      <div className="table-wrap vm-table">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Sistema</th>
              <th>Estado</th>
              <th className="num">Cores</th>
              <th className="num">RAM</th>
              <th className="num">Disco</th>
              {isAdmin && (
                <th>
                  <span className="sr-only">Acciones</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {vms.map((vm) => (
              <tr key={vm.id} className={rowClass(vm)} onClick={() => open(vm)} onKeyDown={onKey(vm)} tabIndex={0}>
                <td className="vm-name">
                  {vm.name}
                  {vm.pending && <span className="saving">Guardando…</span>}
                </td>
                <td>{vm.os}</td>
                <td>
                  <StatusPill status={vm.status} />
                </td>
                <td className="num">{vm.cores}</td>
                <td className="num">{vm.ram} GB</td>
                <td className="num">{fmtGB(vm.disk)}</td>
                {isAdmin && <td>{actions(vm)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cards">
        {vms.map((vm) => (
          <div key={vm.id} className={`card ${rowClass(vm)}`} onClick={() => open(vm)} onKeyDown={onKey(vm)} tabIndex={0}>
            <div className="card-top">
              <span className="vm-name">
                {vm.name}
                {vm.pending && <span className="saving">Guardando…</span>}
              </span>
              <StatusPill status={vm.status} />
            </div>
            <div className="card-specs">
              <span>{vm.os}</span>
              <span>
                <b>{vm.cores}</b> cores
              </span>
              <span>
                <b>{vm.ram}</b> GB RAM
              </span>
              <span>
                <b>{fmtGB(vm.disk)}</b> disco
              </span>
            </div>
            {isAdmin && actions(vm)}
          </div>
        ))}
      </div>
    </>
  );
}
