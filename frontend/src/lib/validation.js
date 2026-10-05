// Validación en tiempo real del formulario de VM (mismas reglas que el backend, más el formato del nombre)
export const LIMITS = { cores: [1, 256], ram: [1, 4096], disk: [1, 65536] };
// Igual que VM_NAME_RE del backend: 2-63 caracteres, empieza por letra o número
export const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{1,62}$/;

function intError(value, [min, max], label, negative) {
  if (value === "" || value === null || value === undefined) return `${label}: campo obligatorio`;
  const n = Number(value);
  if (!Number.isFinite(n)) return `${label}: debe ser un número`;
  if (!Number.isInteger(n)) return `${label}: debe ser un número entero`;
  if (n < 0) return negative;
  if (n < min) return `${label}: mínimo ${min}`;
  if (n > max) return `${label}: máximo ${max.toLocaleString("es")}`;
  return "";
}

export function validateVm(form, existingNames = []) {
  const errors = {};
  const name = form.name.trim();
  if (!name) errors.name = "El nombre es obligatorio";
  else if (name.length < 2) errors.name = "Mínimo 2 caracteres";
  else if (name.length > 63) errors.name = "Máximo 63 caracteres";
  else if (!/^[A-Za-z0-9]/.test(name)) errors.name = "Debe empezar por letra o número";
  else if (!NAME_PATTERN.test(name)) errors.name = "Solo letras, números, '.', '-' y '_' (sin espacios)";
  else if (existingNames.includes(name.toLowerCase())) errors.name = "Ya existe una VM con ese nombre";

  const cores = intError(form.cores, LIMITS.cores, "Cores", "Los cores no pueden ser negativos");
  const ram = intError(form.ram, LIMITS.ram, "RAM", "La RAM no puede ser negativa");
  const disk = intError(form.disk, LIMITS.disk, "Disco", "El disco no puede ser negativo");
  if (cores) errors.cores = cores;
  if (ram) errors.ram = ram;
  if (disk) errors.disk = disk;

  if (!form.os.trim()) errors.os = "El sistema operativo es obligatorio";
  else if (form.os.trim().length > 128) errors.os = "Máximo 128 caracteres";
  return errors;
}
