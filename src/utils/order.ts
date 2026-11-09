import type { OrderStatus } from "@/types/domain";

export function statusClass(status: OrderStatus) {
  if (status === "Entregado") return "status-success";
  if (status === "Rechazado" || status === "Cancelado") return "status-danger";
  if (status === "Pendiente") return "status-warning";
  return "status-info";
}
