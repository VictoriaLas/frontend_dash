// Cliente HTTP de la API. El JWT viaja en una cookie HttpOnly que pone el backend:
// este código nunca lee ni guarda el token, solo envía las cookies con credentials: "include".
export const API_URL = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized = () => {};
// El AuthProvider registra aquí qué hacer cuando la sesión caduca a mitad de uso
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

function errorMessage(body, status) {
  const detail = body?.detail;
  if (typeof detail === "string") return detail;
  // Errores de validación 422 de FastAPI: lista de { loc, msg }
  if (Array.isArray(detail)) return detail.map((d) => `${d.loc?.at(-1) ?? ""}: ${d.msg}`).join(" · ");
  return `Error ${status}`;
}

async function request(method, path, body, { silent401 = false } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor");
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && !silent401) onUnauthorized();
    throw new ApiError(res.status, errorMessage(data, res.status));
  }
  return data;
}

export const api = {
  login: (email, password) => request("POST", "/login", { email, password }, { silent401: true }),
  logout: () => request("POST", "/logout"),
  me: () => request("GET", "/me", undefined, { silent401: true }),
  listVms: () => request("GET", "/vms"),
  createVm: (vm) => request("POST", "/vms", vm),
  updateVm: (id, vm) => request("PUT", `/vms/${id}`, vm),
  deleteVm: (id) => request("DELETE", `/vms/${id}`),
  metrics: (id, range) => request("GET", `/vms/${id}/metrics?range=${encodeURIComponent(range)}`),
};

// URL del WebSocket de tiempo real (mismo origen: la cookie de sesión viaja en el handshake)
export function realtimeUrl() {
  const base = new URL(`${API_URL}/ws`, window.location.href);
  base.protocol = base.protocol === "https:" ? "wss:" : "ws:";
  return base.toString();
}
