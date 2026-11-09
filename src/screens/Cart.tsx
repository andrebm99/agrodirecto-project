"use client";

import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import { Icon } from "@/components/Icon";
import { money } from "@/utils/format";

export function Cart({ cartDetails, navigate, removeFromCart, updateQuantity, cartCount, cartTotal }: Pick<AgroDirectoState, "cartDetails" | "navigate" | "removeFromCart" | "updateQuantity" | "cartCount" | "cartTotal">) {
  return (
    <main className="content-page cart-page">
      <div className="container">
        <div className="page-title compact">
          <span className="eyebrow">Tu seleccion</span>
          <h1>Carrito</h1>
          <p>Los productos de cada pedido deben pertenecer a un solo productor.</p>
        </div>
        {!cartDetails.length ? (
          <div className="empty-state surface-card">
            <span className="empty-state-icon"><Icon name="cart" size={30} /></span>
            <h2>Tu carrito esta vacio</h2>
            <p>Explora el catalogo y agrega productos de un productor.</p>
            <button className="btn btn-brand" onClick={() => navigate("catalogo")}><Icon name="grid" size={16} /> Explorar productos</button>
          </div>
        ) : (
          <div className="checkout-grid">
            <section>
              <div className="single-producer-note">
                <span className="avatar">{cartDetails[0].product.producer.slice(0, 2).toUpperCase()}</span>
                <div><strong>Pedido a {cartDetails[0].product.producer}</strong><span>{cartDetails[0].product.location}</span></div>
                <span><Icon name="check" size={15} /> Un solo productor</span>
              </div>
              <div className="cart-list">
                {cartDetails.map(({ product, quantity }) => (
                  <article className="cart-item" key={product.id}>
                    <img src={product.image} alt="" />
                    <div className="cart-main"><span>{product.category}</span><h2>{product.name}</h2><p>{product.unit} · Stock {product.stock}</p><button onClick={() => removeFromCart(product.id)}><Icon name="trash" size={15} /> Eliminar</button></div>
                    <div className="cart-side"><strong>{money(product.price * quantity)}</strong><div className="quantity-control small"><button onClick={() => updateQuantity(product, quantity - 1)} aria-label="Reducir cantidad"><Icon name="minus" size={15} /></button><span>{quantity}</span><button onClick={() => updateQuantity(product, quantity + 1)} aria-label="Aumentar cantidad"><Icon name="plus" size={15} /></button></div></div>
                  </article>
                ))}
              </div>
              <button className="text-link mt-3" onClick={() => navigate("catalogo")}><Icon name="arrow-left" size={16} /> Seguir explorando</button>
            </section>
            <aside className="order-summary surface-card"><h2>Resumen del pedido</h2><div><span>Productos</span><strong>{cartCount}</strong></div><div><span>Subtotal referencial</span><strong>{money(cartTotal)}</strong></div><div><span>Pago en linea</span><strong>No incluido</strong></div><hr /><div className="summary-total"><span>Total referencial</span><strong>{money(cartTotal)}</strong></div><p>El monto final y la entrega seran coordinados con el productor.</p><button className="btn btn-brand btn-lg w-100" onClick={() => navigate("confirmar")}>Continuar pedido <Icon name="arrow-right" size={16} /></button></aside>
          </div>
        )}
      </div>
    </main>
  );
}
