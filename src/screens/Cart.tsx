"use client";

import { Icon } from "@/components/Icon";
import type { EstadoApp } from "@/hooks/estadoApp";
import { money } from "@/utils/format";

type Props = Pick<EstadoApp, "carrito" | "navigate">;

/** Carrito por presentación. El monto final (descuentos, flete y servicio) lo calcula el servidor al cotizar. */
export function Cart({ carrito, navigate }: Props) {
  const { items, unidades, subtotal, cambiarCantidad, quitar } = carrito;
  const productor = items[0];

  return (
    <main className="content-page cart-page">
      <div className="container">
        <div className="page-title compact">
          <h1>Carrito</h1>
          <p>
            Cada pedido es con un solo productor: así la entrega y la responsabilidad quedan claras.
          </p>
        </div>
        {!items.length ? (
          <div className="empty-state surface-card">
            <span className="empty-state-icon">
              <Icon name="cart" size={30} />
            </span>
            <h2>Tu carrito está vacío</h2>
            <p>Elige productos de un productor y la presentación que necesitas.</p>
            <button className="btn btn-brand" onClick={() => navigate("catalogo")}>
              <Icon name="grid" size={16} /> Explorar productos
            </button>
          </div>
        ) : (
          <div className="checkout-grid">
            <section>
              <div className="single-producer-note">
                <span className="avatar" aria-hidden="true">
                  {productor.productor.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <strong>Pedido a {productor.productor}</strong>
                  <span>{productor.region}</span>
                </div>
                <button
                  className="enlace-texto"
                  onClick={() => navigate("perfil", productor.productorId)}
                >
                  Ver productor
                </button>
              </div>
              <ul className="cart-list">
                {items.map((item) => (
                  <li className="cart-item" key={item.formatoId}>
                    <img src={item.imagenUrl ?? "/images/hero-market.jpg"} alt="" />
                    <div className="cart-main">
                      <h2>
                        <button
                          className="enlace-producto"
                          onClick={() => navigate("producto", item.productoId)}
                        >
                          {item.producto}
                        </button>
                      </h2>
                      <p>
                        {item.formato} · {money(item.precio)} c/u · {item.stock} disponibles
                      </p>
                      <button onClick={() => quitar(item.formatoId)}>
                        <Icon name="trash" size={15} /> Quitar
                      </button>
                    </div>
                    <div className="cart-side">
                      <strong>{money(item.precio * item.cantidad)}</strong>
                      <div className="quantity-control small">
                        <button
                          onClick={() => cambiarCantidad(item.formatoId, item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                          aria-label={`Quitar una unidad de ${item.formato}`}
                        >
                          <Icon name="minus" size={15} />
                        </button>
                        <span aria-live="polite">{item.cantidad}</span>
                        <button
                          onClick={() => cambiarCantidad(item.formatoId, item.cantidad + 1)}
                          disabled={item.cantidad >= item.stock}
                          aria-label={`Agregar una unidad de ${item.formato}`}
                        >
                          <Icon name="plus" size={15} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                className="text-link mt-3"
                onClick={() => navigate("perfil", productor.productorId)}
              >
                <Icon name="arrow-left" size={16} /> Agregar más de {productor.productor}
              </button>
            </section>
            <aside className="order-summary surface-card">
              <h2>Resumen</h2>
              <div>
                <span>Unidades</span>
                <strong>{unidades}</strong>
              </div>
              <div className="summary-total">
                <span>Subtotal de productos</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <p>
                En el siguiente paso eliges cómo recibirlo y ves el detalle exacto: descuento por
                volumen, flete y el servicio de AgroDirecto. El agricultor recibe su precio
                completo.
              </p>
              <button className="btn btn-brand btn-lg w-100" onClick={() => navigate("confirmar")}>
                Continuar <Icon name="arrow-right" size={16} />
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
