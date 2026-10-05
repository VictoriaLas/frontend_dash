import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { api } from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";
import { useRealtime } from "../hooks/useRealtime.js";
import { summarize } from "../lib/summary.js";

// Estado global de las VMs. Las mutaciones son optimistas: la interfaz cambia al instante
// y, si la API falla, se revierte el cambio y se avisa con un toast.
const VmsContext = createContext(null);

const initialState = { status: "idle", items: [], error: "", flash: {} };
const byName = (a, b) => a.name.localeCompare(b.name);

function reducer(state, action) {
  switch (action.type) {
    case "load:start":
      return { ...state, status: state.items.length ? "ready" : "loading", error: "" };
    case "load:ok":
      return { ...state, status: "ready", items: [...action.items].sort(byName) };
    case "load:error":
      return { ...state, status: "error", error: action.error };
    case "upsert": {
      // Inserta o sustituye por id; `replaceId` cambia una VM temporal por la real del servidor
      const drop = new Set([action.vm.id, action.replaceId].filter((x) => x !== undefined));
      return { ...state, items: [...state.items.filter((v) => !drop.has(v.id)), action.vm].sort(byName) };
    }
    case "remove":
      return { ...state, items: state.items.filter((v) => v.id !== action.id) };
    case "flash":
      return { ...state, flash: { ...state.flash, [action.id]: Date.now() } };
    case "unflash": {
      const { [action.id]: _, ...rest } = state.flash;
      return { ...state, flash: rest };
    }
    case "reset":
      return initialState;
    default:
      return state;
  }
}

export function VmsProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const [state, dispatch] = useReducer(reducer, initialState);
  const tempId = useRef(-1);
  const itemsRef = useRef(state.items);
  itemsRef.current = state.items;

  const load = useCallback(async () => {
    dispatch({ type: "load:start" });
    try {
      dispatch({ type: "load:ok", items: await api.listVms() });
    } catch (e) {
      if (e.status !== 401) dispatch({ type: "load:error", error: e.message });
    }
  }, []);

  useEffect(() => {
    if (user) load();
    else dispatch({ type: "reset" });
  }, [user, load]);

  const flash = useCallback((id) => {
    dispatch({ type: "flash", id });
    setTimeout(() => dispatch({ type: "unflash", id }), 1600);
  }, []);

  const createVm = useCallback(
    async (data) => {
      const now = new Date().toISOString();
      const temp = { ...data, id: tempId.current--, created_at: now, updated_at: now, pending: true };
      dispatch({ type: "upsert", vm: temp });
      try {
        const saved = await api.createVm(data);
        dispatch({ type: "upsert", vm: saved, replaceId: temp.id });
        toast.success(`VM ${saved.name} creada`);
      } catch (e) {
        dispatch({ type: "remove", id: temp.id });
        toast.error(`No se pudo crear ${data.name}: ${e.message}`);
      }
    },
    [toast],
  );

  const updateVm = useCallback(
    async (id, data) => {
      const previous = itemsRef.current.find((v) => v.id === id);
      if (!previous) return;
      dispatch({ type: "upsert", vm: { ...previous, ...data, pending: true } });
      try {
        const saved = await api.updateVm(id, data);
        dispatch({ type: "upsert", vm: saved });
        toast.success(`Cambios en ${saved.name} guardados`);
      } catch (e) {
        dispatch({ type: "upsert", vm: previous });
        toast.error(`No se pudo actualizar ${previous.name}: ${e.message}`);
      }
    },
    [toast],
  );

  const deleteVm = useCallback(
    async (id) => {
      const previous = itemsRef.current.find((v) => v.id === id);
      if (!previous) return;
      dispatch({ type: "remove", id });
      try {
        await api.deleteVm(id);
        toast.success(`VM ${previous.name} borrada`);
      } catch (e) {
        dispatch({ type: "upsert", vm: previous });
        toast.error(`No se pudo borrar ${previous.name}: ${e.message}`);
      }
    },
    [toast],
  );

  // Cambios recibidos por WebSocket: { type: "vm.created" | "vm.updated" | "vm.deleted", vm, id, actor }
  const onEvent = useCallback(
    (event) => {
      if (event.type === "vm.deleted") {
        dispatch({ type: "remove", id: event.id });
        return;
      }
      if (event.type !== "vm.created" && event.type !== "vm.updated") return;
      const before = itemsRef.current.find((v) => v.id === event.vm.id);
      // Un cambio nuestro todavía en vuelo lo resuelve su propia petición HTTP
      // (al crear, la VM optimista aún tiene id temporal: se reconoce por el nombre)
      const name = event.vm.name.toLowerCase();
      if (before?.pending || itemsRef.current.some((v) => v.pending && v.id < 0 && v.name.toLowerCase() === name)) return;
      dispatch({ type: "upsert", vm: event.vm });
      // Solo se resaltan los cambios hechos por otros usuarios
      if (event.actor !== user?.email) flash(event.vm.id);
    },
    [flash, user],
  );
  const live = useRealtime(Boolean(user), onEvent, load);

  const value = useMemo(
    () => ({
      ...state,
      summary: summarize(state.items),
      live,
      reload: load,
      createVm,
      updateVm,
      deleteVm,
    }),
    [state, live, load, createVm, updateVm, deleteVm],
  );
  return <VmsContext.Provider value={value}>{children}</VmsContext.Provider>;
}

export const useVms = () => useContext(VmsContext);
