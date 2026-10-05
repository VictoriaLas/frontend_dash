import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useVms } from "../context/VmsContext.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { STATUSES, STATUS_LABEL } from "../lib/format.js";
import { LIMITS, validateVm } from "../lib/validation.js";

const EMPTY = { name: "", cores: "2", ram: "4", disk: "80", os: "Ubuntu 24.04", status: "stopped" };
const toForm = (vm) => ({ name: vm.name, cores: String(vm.cores), ram: String(vm.ram), disk: String(vm.disk), os: vm.os, status: vm.status });

export default function VmFormPage() {
  const { id } = useParams();
  const { status, items } = useVms();
  const editing = id !== undefined;
  const vm = editing ? items.find((v) => v.id === Number(id)) : null;

  if (editing && status !== "ready") return <FormSkeleton />;
  if (editing && !vm)
    return (
      <EmptyState icon="search" title="VM no encontrada" action={<Link className="btn" to="/vms">Volver al listado</Link>}>
        Puede que otro usuario la haya borrado.
      </EmptyState>
    );
  // `key` reinicia el formulario si se pasa de editar una VM a otra
  return <VmForm key={vm?.id ?? "new"} vm={vm} items={items} />;
}

function VmForm({ vm, items }) {
  const { createVm, updateVm } = useVms();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => (vm ? toForm(vm) : EMPTY));
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const otherNames = useMemo(() => items.filter((v) => v.id !== vm?.id).map((v) => v.name.toLowerCase()), [items, vm]);
  // Validación en tiempo real: se recalcula en cada pulsación
  const errors = validateVm(form, otherNames);
  const valid = Object.keys(errors).length === 0;
  const show = (key) => (touched[key] || submitted) && errors[key];

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setTouched((t) => ({ ...t, [key]: true }));
  };

  function submit(e) {
    e.preventDefault();
    setSubmitted(true);
    if (!valid) return;
    const body = { name: form.name.trim(), os: form.os.trim(), status: form.status, cores: Number(form.cores), ram: Number(form.ram), disk: Number(form.disk) };
    // Optimista: se vuelve al listado en el acto; el contexto revierte y avisa si la API falla
    if (vm) updateVm(vm.id, body);
    else createVm(body);
    navigate("/vms");
  }

  const field = (key, label, input, hint) => (
    <div className={`field${show(key) ? " invalid" : ""}`}>
      <label htmlFor={`f-${key}`}>{label}</label>
      {input}
      {show(key) ? (
        <span className="field-error" id={`f-${key}-error`}>
          {errors[key]}
        </span>
      ) : (
        hint && <span className="field-hint">{hint}</span>
      )}
    </div>
  );
  const aria = (key) => ({ "aria-invalid": Boolean(show(key)), "aria-describedby": show(key) ? `f-${key}-error` : undefined });
  const number = (key, label, unit) =>
    field(
      key,
      label,
      <input id={`f-${key}`} type="number" inputMode="numeric" min={LIMITS[key][0]} max={LIMITS[key][1]} step={1} value={form[key]} onChange={set(key)} {...aria(key)} />,
      `${LIMITS[key][0]}–${LIMITS[key][1].toLocaleString("es")}${unit}`,
    );

  return (
    <>
      <div className="page-head">
        <div>
          <Link to="/vms" className="back">
            ← Máquinas virtuales
          </Link>
          <h1>{vm ? `Editar ${vm.name}` : "Nueva máquina virtual"}</h1>
        </div>
      </div>
      <form className="panel form-panel" onSubmit={submit} noValidate>
        <div className="form-grid">
          <div className="full">
            {field(
              "name",
              "Nombre",
              <input id="f-name" maxLength={63} autoFocus autoComplete="off" value={form.name} onChange={set("name")} {...aria("name")} />,
              "Letras, números, '.', '_' y '-'. Ej.: web-01",
            )}
          </div>
          {number("cores", "Cores", "")}
          {number("ram", "RAM (GB)", " GB")}
          {number("disk", "Disco (GB)", " GB")}
          {field(
            "status",
            "Estado",
            <select id="f-status" value={form.status} onChange={set("status")}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>,
          )}
          <div className="full">{field("os", "Sistema operativo", <input id="f-os" maxLength={128} value={form.os} onChange={set("os")} {...aria("os")} />)}</div>
        </div>
        <div className="modal-actions">
          <Link className="btn" to="/vms">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" disabled={submitted && !valid}>
            {vm ? "Guardar cambios" : "Crear VM"}
          </button>
        </div>
      </form>
    </>
  );
}

function FormSkeleton() {
  return (
    <div className="panel form-panel" aria-busy="true">
      <Skeleton width="40%" height={24} />
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} height={44} radius={8} />
      ))}
    </div>
  );
}
