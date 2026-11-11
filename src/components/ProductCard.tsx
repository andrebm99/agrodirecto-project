"use client";

import { Icon } from "@/components/Icon";
import type { ProductoResumen } from "@/types/api";
import { money } from "@/utils/format";

interface Props {
  producto: ProductoResumen;
  favorito: boolean;
  onAbrir: (id: number) => void;
  onFavorito: (id: number) => void;
}

/** Tarjeta del catálogo: precio "desde", presentación más barata, origen y verificación real del productor. */
export function ProductCard({ producto, favorito, onAbrir, onFavorito }: Props) {
  return (
    <article className={`product-card h-100 ${producto.disponible ? "" : "agotado"}`}>
      <div className="product-media">
        <button
          className="product-image-button"
          onClick={() => onAbrir(producto.id)}
          aria-label={`Ver ${producto.nombre}`}
        >
          <img
            className="product-image"
            src={producto.imagenUrl ?? "/images/hero-market.jpg"}
            alt=""
            loading="lazy"
          />
          {producto.organico ? <span className="organic-tag">Orgánico</span> : null}
          {!producto.disponible ? <span className="agotado-tag">Agotado</span> : null}
        </button>
        <button
          className={`favorite-button ${favorito ? "is-favorite" : ""}`}
          onClick={() => onFavorito(producto.id)}
          aria-label={
            favorito
              ? `Quitar ${producto.nombre} de favoritos`
              : `Guardar ${producto.nombre} en favoritos`
          }
          aria-pressed={favorito}
        >
          <Icon name="heart" size={19} fill={favorito ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-card-body">
        <div className="product-meta">
          <span>{producto.categoria}</span>
          <span>{producto.productor.region}</span>
        </div>
        <button className="product-title-button" onClick={() => onAbrir(producto.id)}>
          {producto.nombre}
        </button>
        <p className="producer-line">
          {producto.productor.nombreComercial}
          {producto.productor.verificado ? (
            <span className="sello-verificado">
              <Icon name="check" size={13} /> Verificado
            </span>
          ) : null}
        </p>
        <div className="product-price-row">
          {producto.precioDesde !== null ? (
            <div>
              <small>desde </small>
              <strong>{money(producto.precioDesde)}</strong>
              <small className="d-block">{producto.formatoDesde}</small>
            </div>
          ) : (
            <span className="text-muted">Sin precio</span>
          )}
          <button
            className="icon-action"
            onClick={() => onAbrir(producto.id)}
            aria-label={`Elegir presentación de ${producto.nombre}`}
          >
            <Icon name="arrow-right" size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
