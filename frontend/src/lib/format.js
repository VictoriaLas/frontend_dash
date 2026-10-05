export const STATUSES = ["running", "stopped", "paused", "error"];

export const STATUS_LABEL = { running: "En ejecución", stopped: "Detenida", paused: "Pausada", error: "Error" };

// Colores de estado reservados (no se reutilizan para series); siempre van con etiqueta
export const STATUS_COLOR = { running: "var(--ok)", stopped: "var(--off)", paused: "var(--warn)", error: "var(--bad)" };

export const fmtGB = (gb) => (gb >= 1024 ? `${(gb / 1024).toFixed(1)} TB` : `${gb} GB`);

export const pct = (part, total) => (total ? Math.round((part / total) * 100) : 0);

const timeFmt = new Intl.DateTimeFormat("es", { hour: "2-digit", minute: "2-digit" });
const dayFmt = new Intl.DateTimeFormat("es", { weekday: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export const fmtTime = (iso, range) => (range === "7d" || range === "24h" ? dayFmt : timeFmt).format(new Date(iso));
export const fmtTick = (iso, range) =>
  range === "7d" ? new Intl.DateTimeFormat("es", { weekday: "short", day: "numeric" }).format(new Date(iso)) : timeFmt.format(new Date(iso));
