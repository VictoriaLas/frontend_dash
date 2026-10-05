import { STATUSES } from "./format.js";

// Mismo resumen que GET /summary, calculado en el cliente a partir del estado global,
// así los gráficos reflejan al instante los cambios optimistas
export function summarize(vms) {
  const running = vms.filter((v) => v.status === "running");
  const sum = (list, key) => list.reduce((acc, v) => acc + v[key], 0);
  const byOs = {};
  for (const v of vms) byOs[v.os] = (byOs[v.os] ?? 0) + 1;
  return {
    total_vms: vms.length,
    by_status: Object.fromEntries(STATUSES.map((s) => [s, vms.filter((v) => v.status === s).length])),
    total_cores: sum(vms, "cores"),
    total_ram: sum(vms, "ram"),
    total_disk: sum(vms, "disk"),
    running_vms: running.length,
    running_cores: sum(running, "cores"),
    running_ram: sum(running, "ram"),
    running_disk: sum(running, "disk"),
    by_os: Object.fromEntries(Object.entries(byOs).sort((a, b) => b[1] - a[1])),
  };
}
