import type { Cotizacion, EstadoPedido, MetodoPago, Pedido, PedidoSolicitud } from "@/types/api";
import { api, consulta } from "./cliente";

/** Lado del comprador. */
export const pedidosApi = {
  cotizar: (datos: PedidoSolicitud) => api.post<Cotizacion>("/api/pedidos/cotizacion", datos),
  crear: (datos: PedidoSolicitud) => api.post<Pedido>("/api/pedidos", datos),
  misPedidos: (estado?: EstadoPedido) => api.get<Pedido[]>(`/api/pedidos${consulta({ estado })}`),
  detalle: (id: number) => api.get<Pedido>(`/api/pedidos/${id}`),
  pagar: (id: number, metodo: MetodoPago, numeroOperacion?: string) =>
    api.post<Pedido>(`/api/pedidos/${id}/pago`, { metodo, numeroOperacion }),
  cancelar: (id: number, motivo?: string) =>
    api.post<Pedido>(`/api/pedidos/${id}/cancelar`, { motivo }),
  confirmarRecepcion: (id: number) => api.post<Pedido>(`/api/pedidos/${id}/confirmar-recepcion`),
};

/** Lado del agricultor, su agente o la administración. */
export const pedidosRecibidosApi = {
  listar: (filtro: { productorId?: number; estado?: EstadoPedido } = {}) =>
    api.get<Pedido[]>(`/api/gestion/pedidos${consulta(filtro)}`),
  aceptar: (id: number) => api.post<Pedido>(`/api/gestion/pedidos/${id}/aceptar`),
  rechazar: (id: number, motivo?: string) =>
    api.post<Pedido>(`/api/gestion/pedidos/${id}/rechazar`, { motivo }),
  avanzar: (
    id: number,
    estado: "EN_PREPARACION" | "LISTO_PARA_ENTREGA" | "ENTREGADO",
    comentario?: string,
  ) => api.post<Pedido>(`/api/gestion/pedidos/${id}/estado`, { estado, comentario }),
};
