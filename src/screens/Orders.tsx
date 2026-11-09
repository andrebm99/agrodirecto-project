"use client";

import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import { StatusBadge } from "@/components/StatusBadge";
import { money } from "@/utils/format";
import { STATUS_STEP } from "@/config/order-status";

export function Orders({
  navigate,
  orders,
  buyerOrderFilter,
  setBuyerOrderFilter,
  buyerOrders,
  products,
  setModal,
}: Pick<
  AgroDirectoState,
  | "navigate"
  | "orders"
  | "buyerOrderFilter"
  | "setBuyerOrderFilter"
  | "buyerOrders"
  | "products"
  | "setModal"
>) {
  return (
    <main className="content-page">
      <div className="container">
        <div className="dashboard-title">
          <div>
            <span className="eyebrow">Comprador</span>
            <h1>Mis pedidos</h1>
            <p>Consulta el avance de tus solicitudes registradas.</p>
          </div>
          <button className="btn btn-brand" onClick={() => navigate("catalogo")}>
            Nuevo pedido
          </button>
        </div>
        <div className="order-tabs">
          {[
            ["Todos", orders.length],
            [
              "En proceso",
              orders.filter((o) => !["Entregado", "Cancelado", "Rechazado"].includes(o.status))
                .length,
            ],
            ["Finalizados", orders.filter((o) => o.status === "Entregado").length],
          ].map(([label, count]) => (
            <button
              key={String(label)}
              className={buyerOrderFilter === label ? "active" : ""}
              onClick={() => setBuyerOrderFilter(String(label))}
            >
              {label} <span>{count}</span>
            </button>
          ))}
        </div>
        <div className="orders-list">
          {buyerOrders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card-head">
                <div>
                  <span>Pedido {order.id}</span>
                  <small>
                    {order.date} · {order.producer}
                  </small>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="order-products">
                {order.items.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  return product ? (
                    <div key={item.productId}>
                      <img src={product.image} alt={product.name} />
                      <span>
                        <strong>{product.name}</strong>
                        <small>
                          {item.quantity} × {product.unit}
                        </small>
                      </span>
                    </div>
                  ) : null;
                })}
                <strong className="order-total">{money(order.total)}</strong>
              </div>
              {STATUS_STEP[order.status] > 0 ? (
                <div className="timeline">
                  {["Pendiente", "Aceptado", "En preparación", "Listo", "Entregado"].map(
                    (step, index) => (
                      <div
                        className={index + 1 <= STATUS_STEP[order.status] ? "done" : ""}
                        key={step}
                      >
                        <span>{index + 1 <= STATUS_STEP[order.status] ? "✓" : index + 1}</span>
                        <small>{step}</small>
                      </div>
                    ),
                  )}
                </div>
              ) : null}
              <div className="order-card-foot">
                <span>{order.address}</span>
                <button className="text-link" onClick={() => setModal({ type: "order", order })}>
                  Ver detalle →
                </button>
              </div>
            </article>
          ))}
          {!buyerOrders.length ? (
            <div className="empty-state surface-card">
              <h2>No hay pedidos en esta sección</h2>
              <p>Cambia el filtro o registra un nuevo pedido.</p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
