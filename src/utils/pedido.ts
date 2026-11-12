import type { EstadoPedido, MetodoPago, ModalidadEntrega, MotivoDisputa } from "@/types/api";

type Tono = "success" | "warning" | "info" | "danger";

/** Nombre y color de cada estado del pedido (pares de estado de DESIGN.md). */
export const ESTADO_PEDIDO: Record<EstadoPedido, { texto: string; tono: Tono }> = {
  PENDIENTE_PAGO: { texto: "Falta pagar", tono: "warning" },
  PENDIENTE: { texto: "Esperando al agricultor", tono: "info" },
  ACEPTADO: { texto: "Aceptado", tono: "info" },
  EN_PREPARACION: { texto: "En preparación", tono: "info" },
  LISTO_PARA_ENTREGA: { texto: "Listo para entrega", tono: "info" },
  ENTREGADO: { texto: "Entregado: confirma la recepción", tono: "warning" },
  COMPLETADO: { texto: "Completado", tono: "success" },
  EN_DISPUTA: { texto: "Reclamo en revisión", tono: "danger" },
  REEMBOLSADO: { texto: "Reembolsado", tono: "success" },
  RECHAZADO: { texto: "Rechazado", tono: "danger" },
  CANCELADO: { texto: "Cancelado", tono: "danger" },
};

export const EN_CURSO: EstadoPedido[] = [
  "PENDIENTE_PAGO",
  "PENDIENTE",
  "ACEPTADO",
  "EN_PREPARACION",
  "LISTO_PARA_ENTREGA",
  "ENTREGADO",
  "EN_DISPUTA",
];

export const MODALIDAD: Record<ModalidadEntrega, { titulo: string; detalle: string }> = {
  ENTREGA_DEL_PRODUCTOR: {
    titulo: "Entrega del agricultor",
    detalle: "El agricultor o su agente lo lleva a tu negocio.",
  },
  AGENCIA_DE_CARGA: {
    titulo: "Agencia de carga",
    detalle: "Se despacha por una agencia interprovincial.",
  },
  RECOJO_EN_CHACRA: {
    titulo: "Recojo en chacra",
    detalle: "Lo recoges tú: sin flete ni pedido mínimo.",
  },
};

export const METODO_PAGO: Record<MetodoPago, string> = {
  YAPE: "Yape",
  PLIN: "Plin",
  TARJETA: "Tarjeta",
  TRANSFERENCIA: "Transferencia",
};

export const MOTIVO_RECLAMO: Record<MotivoDisputa, { texto: string; requiereFoto: boolean }> = {
  NO_ENTREGADO: { texto: "No llegó", requiereFoto: false },
  CALIDAD: { texto: "Calidad distinta", requiereFoto: true },
  CANTIDAD: { texto: "Llegó menos cantidad", requiereFoto: true },
  PRODUCTO_DISTINTO: { texto: "Llegó otro producto", requiereFoto: true },
  DANIO_TRANSPORTE: { texto: "Daño durante el transporte", requiereFoto: true },
  OTRO: { texto: "Otro problema", requiereFoto: false },
};

/** Qué puede hacer el comprador cuando una regla de negocio bloquea el pedido. */
export function sugerencia(regla: string | null): string | null {
  switch (regla) {
    case "RN-09":
      return "Elige otra región de entrega, recojo en chacra o busca un productor que llegue a tu zona.";
    case "RN-10":
      return "Elige recojo en chacra o un producto que se conserve más días.";
    case "RN-11":
      return "Agrega más productos del mismo agricultor para alcanzar el pedido mínimo.";
    case "RN-18":
      return "Las cuentas nuevas tienen un tope hasta completar 3 compras o verificar tu identidad.";
    case "RN-03":
      return "Ajusta la cantidad en tu carrito: el stock cambió.";
    default:
      return null;
  }
}
