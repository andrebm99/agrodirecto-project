import type { OrderStatus } from "@/types/domain";

export const STATUS_STEP: Record<OrderStatus, number> = {
  Pendiente: 1,
  Aceptado: 2,
  "En preparación": 3,
  "Listo para entrega": 4,
  Entregado: 5,
  Rechazado: 0,
  Cancelado: 0,
};
