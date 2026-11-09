"use client";

import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import { StatusBadge } from "@/components/StatusBadge";
import { money } from "@/utils/format";

export function AppModal({
  modal,
  setModal,
  setCart,
  setToast,
  deleteProduct,
  products,
  cancelOrder,
  resetDemo,
}: Pick<
  AgroDirectoState,
  | "modal"
  | "setModal"
  | "setCart"
  | "setToast"
  | "deleteProduct"
  | "products"
  | "cancelOrder"
  | "resetDemo"
>) {
  if (!modal) return null;
  let content;
  if (modal.type === "mixed") {
    content = (
      <>
        <span className="modal-icon">!</span>
        <h2>Un productor por pedido</h2>
        <p>
          Tu carrito contiene productos de otro productor. Para agregar{" "}
          <strong>{modal.product?.name}</strong>, primero debes completar o vaciar el pedido actual.
        </p>
        <div className="modal-actions">
          <button className="btn btn-soft" onClick={() => setModal(null)}>
            Mantener carrito
          </button>
          <button
            className="btn btn-brand"
            onClick={() => {
              const product = modal.product!;
              setCart([{ productId: product.id, quantity: 1 }]);
              setModal(null);
              setToast("Se inició un nuevo carrito para este productor.");
            }}
          >
            Vaciar y agregar
          </button>
        </div>
      </>
    );
  } else if (modal.type === "delete") {
    content = (
      <>
        <span className="modal-icon danger">×</span>
        <h2>Retirar publicación</h2>
        <p>
          ¿Deseas retirar <strong>{modal.product?.name}</strong>? Ya no aparecerá en el catálogo,
          pero se conservará en el historial local.
        </p>
        <div className="modal-actions">
          <button className="btn btn-soft" onClick={() => setModal(null)}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={() => deleteProduct(modal.product!)}>
            Retirar
          </button>
        </div>
      </>
    );
  } else if (modal.type === "order" && modal.order) {
    const order = modal.order;
    content = (
      <>
        <div className="modal-order-head">
          <div>
            <span className="eyebrow">Detalle del pedido</span>
            <h2>{order.id}</h2>
            <p>
              {order.date} · {order.producer}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="modal-order-products">
          {order.items.map((item) => {
            const product = products.find((candidate) => candidate.id === item.productId);
            return product ? (
              <div key={item.productId}>
                <img src={product.image} alt={product.name} />
                <span>
                  <strong>{product.name}</strong>
                  <small>
                    {item.quantity} × {product.unit}
                  </small>
                </span>
                <b>{money(item.quantity * product.price)}</b>
              </div>
            ) : null;
          })}
        </div>
        <div className="modal-order-data">
          <div>
            <span>Entrega o referencia</span>
            <strong>{order.address}</strong>
          </div>
          <div>
            <span>Observación</span>
            <strong>{order.note}</strong>
          </div>
          <div>
            <span>Total referencial</span>
            <strong>{money(order.total)}</strong>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-soft" onClick={() => setModal(null)}>
            Cerrar
          </button>
          {order.status === "Pendiente" ? (
            <button className="btn btn-outline-danger" onClick={() => cancelOrder(order)}>
              Cancelar pedido
            </button>
          ) : null}
        </div>
      </>
    );
  } else if (modal.type === "reset") {
    content = (
      <>
        <span className="modal-icon">↻</span>
        <h2>Restablecer demostración</h2>
        <p>
          Se eliminarán de este dispositivo los productos añadidos, borradores, favoritos, carrito y
          cambios de pedidos. Los datos iniciales volverán a mostrarse.
        </p>
        <div className="modal-actions">
          <button className="btn btn-soft" onClick={() => setModal(null)}>
            Conservar datos
          </button>
          <button className="btn btn-danger" onClick={resetDemo}>
            Restablecer
          </button>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <span className="modal-icon">i</span>
        <h2>{modal.title ?? "Función del prototipo"}</h2>
        <p>{modal.message ?? "Esta opción está representada en el flujo académico."}</p>
        <div className="modal-actions">
          <button className="btn btn-brand" onClick={() => setModal(null)}>
            Entendido
          </button>
        </div>
      </>
    );
  }
  return (
    <div className="modal-backdrop-custom">
      <div
        className={`modal-card ${modal.type === "order" ? "modal-card-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={modal.type === "order" ? `Detalle del pedido ${modal.order?.id}` : undefined}
      >
        {content}
      </div>
    </div>
  );
}
