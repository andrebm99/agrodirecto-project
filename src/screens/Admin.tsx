"use client";

import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import { productStatus } from "@/utils/product";
import { ProductStatusBadge } from "@/components/ProductStatusBadge";
import { money } from "@/utils/format";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryIcon } from "@/components/CategoryIcon";

export function Admin({
  activeProducts,
  orders,
  products,
  adminTab,
  setAdminTab,
  showInfo,
  setModal,
}: Pick<
  AgroDirectoState,
  "activeProducts" | "orders" | "products" | "adminTab" | "setAdminTab" | "showInfo" | "setModal"
>) {
  return (
    <main className="dashboard-page admin-page">
      <div className="container">
        <div className="dashboard-title">
          <div>
            <span className="eyebrow">Administración</span>
            <h1>Control general</h1>
          </div>
          <span className="prototype-chip">Datos simulados</span>
        </div>
        <div className="kpi-grid admin-kpis">
          <div>
            <span>Usuarios</span>
            <strong>28</strong>
            <small>18 compradores · 9 productores</small>
          </div>
          <div>
            <span>Productos activos</span>
            <strong>{activeProducts.length}</strong>
            <small>4 categorías</small>
          </div>
          <div>
            <span>Pedidos</span>
            <strong>{orders.length}</strong>
            <small>{orders.filter((o) => o.status === "Pendiente").length} pendientes</small>
          </div>
          <div>
            <span>Borradores</span>
            <strong>
              {products.filter((product) => productStatus(product) === "Borrador").length}
            </strong>
            <small>Revisión local</small>
          </div>
        </div>
        <section className="dashboard-panel">
          <div className="admin-tabs">
            {["resumen", "usuarios", "categorías", "productos", "pedidos"].map((item) => (
              <button
                key={item}
                className={adminTab === item ? "active" : ""}
                onClick={() => setAdminTab(item)}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
          {adminTab === "resumen" ? (
            <div className="admin-overview">
              <div>
                <span className="eyebrow">Actividad</span>
                <h2>Operación del prototipo</h2>
                <div className="bar-list">
                  <div>
                    <span>Productos con stock</span>
                    <b>
                      <i
                        style={{
                          width: `${activeProducts.length ? Math.round((activeProducts.filter((product) => product.stock > 0).length / activeProducts.length) * 100) : 0}%`,
                        }}
                      ></i>
                    </b>
                    <strong>
                      {activeProducts.length
                        ? Math.round(
                            (activeProducts.filter((product) => product.stock > 0).length /
                              activeProducts.length) *
                              100,
                          )
                        : 0}
                      %
                    </strong>
                  </div>
                  <div>
                    <span>Pedidos atendidos</span>
                    <b>
                      <i
                        style={{
                          width: `${orders.length ? Math.round((orders.filter((order) => order.status === "Entregado").length / orders.length) * 100) : 0}%`,
                        }}
                      ></i>
                    </b>
                    <strong>
                      {orders.length
                        ? Math.round(
                            (orders.filter((order) => order.status === "Entregado").length /
                              orders.length) *
                              100,
                          )
                        : 0}
                      %
                    </strong>
                  </div>
                  <div>
                    <span>Perfiles completos</span>
                    <b>
                      <i style={{ width: "81%" }}></i>
                    </b>
                    <strong>81%</strong>
                  </div>
                </div>
              </div>
              <div className="moderation-box">
                <h2>Revisión del contenido</h2>
                <p>
                  {products.filter((product) => productStatus(product) !== "Activo").length}{" "}
                  publicaciones no están visibles en el catálogo.
                </p>
                <button className="btn btn-brand" onClick={() => setAdminTab("productos")}>
                  Revisar productos
                </button>
              </div>
            </div>
          ) : null}
          {adminTab === "usuarios" ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Región</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Carlos Huamán", "Productor", "Junín"],
                    ["María Quispe", "Comprador", "Lima"],
                    ["Rosa Paredes", "Productor", "Ica"],
                    ["Luis Flores", "Comprador", "Lima"],
                  ].map((u) => (
                    <tr key={u[0]}>
                      <td>
                        <strong>{u[0]}</strong>
                        <small className="d-block">usuario@demo.pe</small>
                      </td>
                      <td>{u[1]}</td>
                      <td>{u[2]}</td>
                      <td>
                        <span className="status-badge status-success">Activo</span>
                      </td>
                      <td>
                        <button
                          className="table-link"
                          onClick={() =>
                            showInfo(
                              `Perfil de ${u[0]}`,
                              `Rol: ${u[1]}. Región: ${u[2]}. En el Avance 2 esta información será consultada desde Spring Boot.`,
                            )
                          }
                        >
                          Ver perfil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {adminTab === "categorías" ? (
            <div className="category-admin">
              {["Tubérculos", "Hortalizas", "Frutas", "Granos"].map((item) => (
                <div key={item}>
                  <span>
                    <CategoryIcon label={item} />
                  </span>
                  <strong>{item}</strong>
                  <small>{products.filter((p) => p.category === item).length} productos</small>
                  <button
                    onClick={() =>
                      showInfo(
                        `Categoría ${item}`,
                        "La edición estructural de categorías quedará conectada al backend en el Avance 2. En este prototipo se muestra su impacto en el catálogo.",
                      )
                    }
                  >
                    Ver detalle
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          {adminTab === "productos" ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Productor</th>
                    <th>Unidad</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="table-product">
                          <img src={p.image} alt={p.name} />
                          <strong>{p.name}</strong>
                        </div>
                      </td>
                      <td>{p.producer}</td>
                      <td>{p.unit}</td>
                      <td>
                        <ProductStatusBadge status={productStatus(p)} />
                      </td>
                      <td>
                        <button
                          className="table-link"
                          onClick={() =>
                            showInfo(
                              `Revisión: ${p.name}`,
                              `${p.producer} · ${p.location} · ${p.unit} · Stock ${p.stock}.`,
                            )
                          }
                        >
                          Revisar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {adminTab === "pedidos" ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Productor</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <strong>{o.id}</strong>
                        <small className="d-block">{o.date}</small>
                      </td>
                      <td>{o.producer}</td>
                      <td>{money(o.total)}</td>
                      <td>
                        <StatusBadge status={o.status} />
                      </td>
                      <td>
                        <button
                          className="table-link"
                          onClick={() => setModal({ type: "order", order: o })}
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
