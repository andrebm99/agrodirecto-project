"use client";

import type { EstadoApp } from "@/hooks/estadoApp";
import { ProducerDashboard } from "@/screens/ProducerDashboard";

type Props = Pick<
  EstadoApp,
  "navigate" | "setToast" | "gestion" | "catalogo" | "sessionRole" | "view"
>;

/** #recibidos abre el panel en la pestaña de pedidos. */
export function ReceivedOrders(props: Props) {
  return <ProducerDashboard {...props} />;
}
