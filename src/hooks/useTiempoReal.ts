"use client";

import { Client } from "@stomp/stompjs";
import type { IMessage, StompSubscription } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";

import { WS_URL } from "@/config/api";
import type { GestionState } from "@/hooks/useGestion";
import type { SesionState } from "@/hooks/useSesion";
import { leerToken } from "@/services/api";
import type { EventoPedido, EventoStock } from "@/types/api";
import { ESTADO_PEDIDO } from "@/utils/pedido";

/**
 * Conexión WebSocket (STOMP) con el backend. Con sesión se autentica con el JWT; sin sesión solo sirve
 * para canales públicos (stock). Cada evento de pedido incrementa `version`, que las listas usan para
 * volver a consultar sin recargar la página.
 */
export function useTiempoReal(
  sesion: SesionState,
  gestion: GestionState,
  avisar: (texto: string) => void,
) {
  const [cliente, setCliente] = useState<Client | null>(null);
  const [version, setVersion] = useState(0);
  const avisarRef = useRef(avisar);
  useEffect(() => {
    avisarRef.current = avisar;
  }, [avisar]);
  const usuarioId = sesion.usuario?.id ?? null;
  const rol = sesion.rol;
  const productorIds = gestion.productores.map((p) => p.id).join(",");

  // Una conexión por sesión: se rehace al iniciar o cerrar sesión.
  useEffect(() => {
    const token = usuarioId ? leerToken() : null;
    const nuevo = new Client({
      brokerURL: WS_URL,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
    });
    nuevo.onConnect = () => setCliente(nuevo);
    nuevo.onWebSocketClose = () => setCliente((actual) => (actual === nuevo ? null : actual));
    nuevo.activate();
    return () => {
      void nuevo.deactivate();
    };
  }, [usuarioId]);

  // Suscripciones a pedidos según el rol.
  useEffect(() => {
    if (!cliente || !usuarioId) return;
    const alEvento = (mensaje: IMessage) => {
      const evento = JSON.parse(mensaje.body) as EventoPedido;
      setVersion((v) => v + 1);
      if (rol === "comprador" && evento.estado !== "PENDIENTE_PAGO") {
        avisarRef.current(
          `Tu pedido ${evento.codigo}: ${ESTADO_PEDIDO[evento.estado].texto.toLowerCase()}.`,
        );
      } else if (rol !== "comprador" && evento.estado === "PENDIENTE") {
        avisarRef.current(`Nuevo pedido pagado ${evento.codigo} para ${evento.productor}.`);
      }
    };
    const destinos =
      rol === "comprador"
        ? ["/user/queue/pedidos"]
        : productorIds
          ? productorIds.split(",").map((id) => `/topic/productores/${id}/pedidos`)
          : [];
    const suscripciones: StompSubscription[] = destinos.map((d) => cliente.subscribe(d, alEvento));
    return () => suscripciones.forEach((s) => s.unsubscribe());
  }, [cliente, usuarioId, rol, productorIds]);

  /** Stock en vivo de un producto (canal público). Devuelve la función para cancelar. */
  const escucharStock = (productoId: number, alCambiar: (evento: EventoStock) => void) => {
    if (!cliente) return () => undefined;
    const s = cliente.subscribe(`/topic/productos/${productoId}/stock`, (m) =>
      alCambiar(JSON.parse(m.body)),
    );
    return () => s.unsubscribe();
  };

  return { conectado: cliente !== null, version, escucharStock };
}

export type TiempoRealState = ReturnType<typeof useTiempoReal>;
