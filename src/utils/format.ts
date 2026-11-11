export function money(value: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(value);
}

/** "2026-08-12" → "12 ago. 2026". Las fechas sin hora se leen en UTC para no correr un día. */
export function fecha(valor: string) {
  const soloFecha = /^\d{4}-\d{2}-\d{2}$/.test(valor);
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: soloFecha ? "UTC" : undefined,
  }).format(new Date(valor));
}
