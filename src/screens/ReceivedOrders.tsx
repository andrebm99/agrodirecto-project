"use client";

import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import { StatusBadge } from "@/components/StatusBadge";
import { money } from "@/utils/format";

export function ReceivedOrders({
  orders,
  orderFilter,
  navigate,
  setOrderFilter,
  products,
  changeOrderStatus,
}: Pick<
  AgroDirectoState,
  "orders" | "orderFilter" | "navigate" | "setOrderFilter" | "products" | "changeOrderStatus"
>) {
  const received = orders.filter(
    (o) => o.producerId === 1 && (orderFilter === "Todos" || o.status === orderFilter),
  );
  return (
    <main className="dashboard-page">
      <div className="container">
        <div className="dashboard-title">
          <div>
            <span className="eyebrow">AndesVerde</span>
            <h1>Pedidos recibidos</h1>
            <p>Revisa y actualiza las solicitudes de tus compradores.</p>
          </div>
          <button className="btn btn-soft" onClick={() => navigate("productor")}>
            Volver al panel
          </button>
        </div>
        <div className="filter-pills mb-4">
          {["Todos", "Pendiente", "Aceptado", "En preparación", "Entregado"].map((item) => (
            <button
              key={item}
              className={orderFilter === item ? "active" : ""}
              onClick={() => setOrderFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="received-list">
          {received.map((order) => (
            <article className="received-card" key={order.id}>
              <div className="received-main">
                <div className="order-card-head">
                  <div>
                    <span>Pedido {order.id}</span>
                    <small>{order.date} · Comprador de demostración</small>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="received-products">
                  {order.items.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    return product ? (
                      <div key={item.productId}>
                        <span>{item.quantity}×</span>
                        <strong>{product.name}</strong>
                        <small>{product.unit}</small>
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="received-info">
                  <span>
                    <small>Entrega</small>
                    {order.address}
                  </span>
                  <span>
                    <small>Observación</small>
                    {order.note}
                  </span>
                </div>
              </div>
              <aside>
                <span>Total referencial</span>
                <strong>{money(order.total)}</strong>
                {order.status === "Pendiente" ? (
                  <div className="action-stack">
                    <button
                      className="btn btn-brand"
                      onClick={() => changeOrderStatus(order.id, "Aceptado")}
                    >
                      Aceptar pedido
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => changeOrderStatus(order.id, "Rechazado")}
                    >
                      Rechazar
                    </button>
                  </div>
                ) : order.status === "Aceptado" ? (
                  <button
                    className="btn btn-brand"
                    onClick={() => changeOrderStatus(order.id, "En preparación")}
                  >
                    Iniciar preparación
                  </button>
                ) : order.status === "En preparación" ? (
                  <button
                    className="btn btn-brand"
                    onClick={() => changeOrderStatus(order.id, "Listo para entrega")}
                  >
                    Marcar como listo
                  </button>
                ) : order.status === "Listo para entrega" ? (
                  <button
                    className="btn btn-brand"
                    onClick={() => changeOrderStatus(order.id, "Entregado")}
                  >
                    Marcar entregado
                  </button>
                ) : (
                  <button className="btn btn-soft" disabled>
                    Sin acciones
                  </button>
                )}
              </aside>
            </article>
          ))}
          {!received.length && (
            <div className="empty-state surface-card">
              <h2>No hay pedidos en este estado</h2>
              <p>Selecciona otro filtro para continuar.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
