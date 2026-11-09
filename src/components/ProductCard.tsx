"use client";

import type { Product } from "@/types/domain";
import { money } from "@/utils/format";
import { Icon } from "@/components/Icon";

export function ProductCard({ product, onOpen, onAdd, onFavorite, favorite }: { product: Product; onOpen: (id: number) => void; onAdd: (product: Product) => void; onFavorite: (id: number) => void; favorite: boolean }) {
  return <article className="product-card h-100">
    <div className="product-media">
      <button className="product-image-button" onClick={() => onOpen(product.id)} aria-label={`Ver ${product.name}`}>
        <img className="product-image" src={product.image} alt={product.name} />
        {product.organic ? <span className="organic-tag">Organico</span> : null}
      </button>
      <button className={`favorite-button ${favorite ? "is-favorite" : ""}`} onClick={() => onFavorite(product.id)} aria-label={favorite ? `Quitar ${product.name} de favoritos` : `Guardar ${product.name} en favoritos`} aria-pressed={favorite}>
        <Icon name="heart" size={19} fill={favorite ? "currentColor" : "none"} />
      </button>
    </div>
    <div className="product-card-body">
      <div className="product-meta"><span>{product.category}</span><span className="rating-inline"><Icon name="star" size={12} fill="currentColor" /> 4.8</span></div>
      <button className="product-title-button" onClick={() => onOpen(product.id)}>{product.name}</button>
      <p className="producer-line">Por <strong>{product.producer}</strong> · {product.location}</p>
      <div className="product-price-row"><div><strong>{money(product.price)}</strong><small> / {product.unit.toLowerCase()}</small></div><button className="icon-action" onClick={() => onAdd(product)} aria-label={`Agregar ${product.name} al carrito`}><Icon name="plus" size={18} /></button></div>
    </div>
  </article>;
}
