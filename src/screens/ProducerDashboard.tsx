"use client";

import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import { productStatus } from "@/utils/product";
import { money } from "@/utils/format";
import { ProductStatusBadge } from "@/components/ProductStatusBadge";
import { StatusBadge } from "@/components/StatusBadge";

export function ProducerDashboard({
  products,
  orders,
  navigate,
  setModal,
  publishProduct,
}: Pick<AgroDirectoState, "products" | "orders" | "navigate" | "setModal" | "publishProduct">) {
  const myProducts = products.filter((p) => p.producerId === 1);
  const activeMine = myProducts.filter((product) => productStatus(product) === "Activo");
  const drafts = myProducts.filter((product) => productStatus(product) === "Borrador");
  const received = orders.filter((o) => o.producerId === 1);
  return (
    <main className="dashboard-page">
      <div className="container">
        <div className="dashboard-title">
          <div>
            <span className="eyebrow">AndesVerde · Productor verificado</span>
            <h1>Buenos días, Carlos</h1>
            <p>Gestiona tu oferta y atiende las solicitudes recibidas.</p>
          </div>
          <button className="btn btn-brand" onClick={() => navigate("publicar")}>
            + Publicar producto
          </button>
        </div>
        
        <div className="kpi-grid">
          <div>
            <span>Productos activos</span>
            <strong>{activeMine.length}</strong>
            <small>{drafts.length} borradores</small>
          </div>
          <div>
            <span>Pedidos pendientes</span>
            <strong>{received.filter((o) => o.status === "Pendiente").length}</strong>
            <small>Requieren atención</small>
          </div>
          <div>
            <span>Stock publicado</span>
            <strong>{activeMine.reduce((sum, p) => sum + p.stock, 0)}</strong>
            <small>Unidades de venta</small>
          </div>
          <div>
            <span>Ventas referenciales</span>
            <strong>
              {money(
                received
                  .filter((order) => order.status === "Entregado")
                  .reduce((sum, order) => sum + order.total, 0),
              )}
            </strong>
            <small>Datos simulados</small>
          </div>
        </div>
        <div className="dashboard-grid">
          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h2>Mis productos</h2>
                <p>Publicaciones, borradores y productos retirados.</p>
              </div>
              <button className="text-link" onClick={() => navigate("publicar")}>
                Agregar producto
              </button>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {myProducts.map((product) => {
                    const status = productStatus(product);
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="table-product">
                            <img src={product.image} alt={product.name} />
                            <span>
                              <strong>{product.name}</strong>
                              <small>{product.unit}</small>
                            </span>
                          </div>
                        </td>
                        <td>{product.price ? money(product.price) : "Pendiente"}</td>
                        <td>{product.stock}</td>
                        <td>
                          <ProductStatusBadge status={status} />
                        </td>
                        <td>
                          <div className="table-actions">
                            <button onClick={() => navigate("publicar", product.id)}>
                              {status === "Borrador" ? "Continuar" : "Editar"}
                            </button>
                            {status === "Activo" ? (
                              <button
                                className="danger"
                                onClick={() => setModal({ type: "delete", product })}
                              >
                                Retirar
                              </button>
                            ) : (
                              <button onClick={() => publishProduct(product.id)}>Publicar</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
          <aside className="dashboard-panel compact-panel">
            <div className="panel-heading">
              <div>
                <h2>Pedidos recientes</h2>
                <p>Solicitudes para AndesVerde.</p>
              </div>
            </div>
            {received.slice(0, 3).map((order) => (
              <button
                className="mini-order"
                key={order.id}
                onClick={() => setModal({ type: "order", order })}
              >
                <span>
                  <strong>{order.id}</strong>
                  <small>
                    {order.items.reduce((s, i) => s + i.quantity, 0)} unidades ·{" "}
                    {money(order.total)}
                  </small>
                </span>
                <StatusBadge status={order.status} />
              </button>
            ))}
            <button className="btn btn-soft w-100 mt-3" onClick={() => navigate("recibidos")}>
              Gestionar pedidos
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
