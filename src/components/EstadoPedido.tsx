import type { EstadoPedido as Estado } from "@/types/api";
import { ESTADO_PEDIDO } from "@/utils/pedido";

export function EstadoPedido({ estado }: { estado: Estado }) {
  const { texto, tono } = ESTADO_PEDIDO[estado];
  return <span className={`status-badge status-${tono} estado-pedido`}>{texto}</span>;
}
