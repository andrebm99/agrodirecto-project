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
    // Se activa con una pequeña espera: si el efecto se desmonta enseguida (modo estricto de React en
    // desarrollo, o un login inmediato), no llega a abrirse un socket que habría que cerrar a medias.
    const espera = window.setTimeout(() => nuevo.activate(), 150);
    return () => {
      window.clearTimeout(espera);
      // force: cierra sin enviar DISCONNECT (evita escribir en un socket que ya se está cerrando).
      if (nuevo.active) void nuevo.deactivate({ force: true });
    };
  }, [usuarioId]);

  // Suscripciones a pedidos según el rol.
  useEffect(() => {
    // Un cliente que ya se está cerrando (por ejemplo, al iniciar sesión) no acepta suscripciones.
    if (!cliente?.connected || !usuarioId) return;
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
    const suscripciones: StompSubscription[] = [];
    for (const destino of destinos) {
      try {
        suscripciones.push(cliente.subscribe(destino, alEvento));
      } catch {
        // Si la conexión se cayó justo ahora, la reconexión volverá a suscribir.
      }
    }
    return () => suscripciones.forEach((s) => s.unsubscribe());
  }, [cliente, usuarioId, rol, productorIds]);

  /** Stock en vivo de un producto (canal público). Devuelve la función para cancelar. */
  const escucharStock = (productoId: number, alCambiar: (evento: EventoStock) => void) => {
    if (!cliente?.connected) return () => undefined;
    try {
      const s = cliente.subscribe(`/topic/productos/${productoId}/stock`, (m) =>
        alCambiar(JSON.parse(m.body)),
      );
      return () => s.unsubscribe();
    } catch {
      return () => undefined;
    }
  };

  return { conectado: cliente !== null, version, escucharStock };
}

export type TiempoRealState = ReturnType<typeof useTiempoReal>;
