"use client";

import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import { money } from "@/utils/format";

export function Checkout({
  navigate,
  cartDetails,
  handleCheckout,
  cartTotal,
}: Pick<AgroDirectoState, "navigate" | "cartDetails" | "handleCheckout" | "cartTotal">) {
  return (
    <main className="content-page">
      <div className="container">
        <button className="back-link" onClick={() => navigate("carrito")}>
          ← Volver al carrito
        </button>
        <div className="page-title compact">
          <span className="eyebrow">Paso final</span>
          <h1>Confirmar pedido</h1>
          <p>Revisa los datos. Esta acción no realizará ningún cobro.</p>
        </div>
        {!cartDetails.length ? (
          <div className="empty-state surface-card">
            <h2>No hay productos para confirmar</h2>
            <button className="btn btn-brand" onClick={() => navigate("catalogo")}>
              Ir al catálogo
            </button>
          </div>
        ) : (
          <form className="checkout-grid" onSubmit={handleCheckout}>
            <section className="surface-card form-card">
              <h2>Datos de coordinación</h2>
              <div className="row g-3">
                <div className="col-md-6">
                  <label>
                    Nombre del contacto
                    <input className="form-control" required defaultValue="María Quispe" />
                  </label>
                </div>
                <div className="col-md-6">
                  <label>
                    Teléfono
                    <input className="form-control" required defaultValue="987 654 321" />
                  </label>
                </div>
                <div className="col-12">
                  <label>
                    Dirección o referencia
                    <textarea
                      className="form-control"
                      name="address"
                      required
                      defaultValue="Av. Arequipa 1840, Lince, Lima"
                    />
                  </label>
                </div>
                <div className="col-12">
                  <label>
                    Observaciones
                    <textarea
                      className="form-control"
                      name="note"
                      defaultValue="Recepción por almacén entre 9:00 y 13:00."
                    />
                  </label>
                </div>
              </div>
              <div className="coordination-box">
                <span>i</span>
                <div>
                  <strong>Coordinación directa</strong>
                  <p>
                    AgroDirecto no procesa pagos. El productor confirmará disponibilidad, total y
                    condiciones de entrega.
                  </p>
                </div>
              </div>
            </section>
            <aside className="order-summary surface-card">
              <h2>Tu solicitud</h2>
              {cartDetails.map(({ product, quantity }) => (
                <div className="summary-product" key={product.id}>
                  <img src={product.image} alt="" />
                  <span>
                    <strong>{product.name}</strong>
                    <small>
                      {quantity} × {money(product.price)}
                    </small>
                  </span>
                  <b>{money(quantity * product.price)}</b>
                </div>
              ))}
              <hr />
              <div>
                <span>Productor</span>
                <strong>{cartDetails[0].product.producer}</strong>
              </div>
              <div className="summary-total">
                <span>Total referencial</span>
                <strong>{money(cartTotal)}</strong>
              </div>
              <label className="check-line consent">
                <input type="checkbox" required /> Entiendo que no se realizará ningún pago en
                línea.
              </label>
              <button className="btn btn-brand btn-lg w-100" type="submit">
                Registrar pedido
              </button>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
