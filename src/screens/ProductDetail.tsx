"use client";

import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import { money } from "@/utils/format";
import { LeafletMap } from "@/components/LeafletMap";

export function ProductDetail({
  navigate,
  selectedProduct,
  favorites,
  toggleFavorite,
  setQuantity,
  quantity,
  addToCart,
}: Pick<
  AgroDirectoState,
  | "navigate"
  | "selectedProduct"
  | "favorites"
  | "toggleFavorite"
  | "setQuantity"
  | "quantity"
  | "addToCart"
>) {
  return (
    <main className="content-page">
      <div className="container">
        <div className="breadcrumb-line">
          <button onClick={() => navigate("catalogo")}>Catálogo</button>
          <span>/</span>
          <span>{selectedProduct.category}</span>
          <span>/</span>
          <strong>{selectedProduct.name}</strong>
        </div>
        <div className="product-detail-grid">
          <div className="detail-image-wrap">
            <img src={selectedProduct.image} alt={selectedProduct.name} />
            {selectedProduct.organic ? (
              <span className="organic-tag">Producción orgánica</span>
            ) : null}
          </div>
          <div className="detail-content">
            <div className="detail-title-row">
              <span className="category-label">{selectedProduct.category}</span>
              <button
                className={`detail-favorite ${favorites.includes(selectedProduct.id) ? "is-favorite" : ""}`}
                onClick={() => toggleFavorite(selectedProduct.id)}
                aria-pressed={favorites.includes(selectedProduct.id)}
              >
                {favorites.includes(selectedProduct.id) ? "♥ Guardado" : "♡ Guardar"}
              </button>
            </div>
            <h1>{selectedProduct.name}</h1>
            <div className="rating-row">
              <span>★★★★★</span>
              <strong>4.8</strong>
              <small>24 valoraciones simuladas</small>
            </div>
            <p className="detail-description">{selectedProduct.description}</p>
            <div className="price-block">
              <strong>{money(selectedProduct.price)}</strong>
              <span>por {selectedProduct.unit.toLowerCase()}</span>
            </div>
            <div className="availability">
              <div>
                <span>Stock disponible</span>
                <strong>{selectedProduct.stock} unidades de venta</strong>
              </div>
              <div>
                <span>Disponibilidad</span>
                <strong>{selectedProduct.harvest}</strong>
              </div>
            </div>
            <div className="quantity-row">
              <div className="quantity-control">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Reducir cantidad"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
              <button
                className="btn btn-brand btn-lg flex-grow-1"
                disabled={selectedProduct.stock < 1}
                onClick={() => addToCart(selectedProduct, quantity)}
              >
                {selectedProduct.stock < 1 ? "Sin stock" : "Agregar al carrito"}
              </button>
            </div>
            <p className="no-payment-note">
              No se realizará ningún cobro. El pago y la entrega se coordinan con el productor.
            </p>
          </div>
        </div>
        <div className="detail-lower-grid">
          <section className="surface-card producer-card">
            <div className="producer-header">
              <span className="avatar large">
                {selectedProduct.producer.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <span className="eyebrow">Productor</span>
                <h2>{selectedProduct.producer}</h2>
                <p>{selectedProduct.location} · Perfil de demostración</p>
              </div>
              <span className="verified big">✓ Verificado</span>
            </div>
            <div className="producer-facts">
              <span>
                <strong>4.9</strong> valoración
              </span>
              <span>
                <strong>98%</strong> respuesta
              </span>
              <span>
                <strong>3 años</strong> experiencia referencial
              </span>
            </div>
          </section>
          <section className="surface-card map-card">
            <div>
              <span className="eyebrow">Origen visible</span>
              <h2>Ubicación aproximada</h2>
              <p>La dirección exacta se protege y se coordina después de aceptar el pedido.</p>
            </div>
            <LeafletMap
              lat={selectedProduct.lat}
              lng={selectedProduct.lng}
              label={selectedProduct.producer}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
