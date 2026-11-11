"use client";

import type { EstadoApp } from "@/hooks/estadoApp";
import { useConsulta } from "@/hooks/useConsulta";
import { ProductCard } from "@/components/ProductCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import { catalogoApi } from "@/services/api";

export function Home({
  navigate,
  setRole,
  catalogo,
  setToast,
}: Pick<EstadoApp, "navigate" | "setRole" | "catalogo" | "setToast">) {
  // Productos publicados hoy: los primeros alimentan la vitrina y el total, las cifras reales del inicio.
  const publicados = useConsulta("inicio:productos", (signal) => catalogoApi.buscar({}, signal));
  const productos = publicados.datos ?? [];
  const regiones = new Set(productos.map((p) => p.productor.region)).size;
  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Comercio agrícola más directo</span>
            <h1>
              Del campo a tu negocio, <em>sin tantos intermediarios.</em>
            </h1>
            <p>
              Encuentra productos frescos, conoce su origen y coordina pedidos directamente con
              pequeños productores del Perú.
            </p>
            <div className="hero-actions">
              <button className="btn btn-brand btn-lg" onClick={() => navigate("catalogo")}>
                Explorar productos <span>→</span>
              </button>
              <button
                className="btn btn-soft btn-lg"
                onClick={() => {
                  setRole("productor");
                  navigate("registro");
                }}
              >
                Quiero vender
              </button>
            </div>
            <div className="trust-row">
              <span>✓ Productores verificados</span>
              <span>✓ Origen visible</span>
              <span>✓ Pago protegido hasta la entrega</span>
            </div>
          </div>
          <div className="hero-visual" aria-label="Productos frescos en un mercado agrícola">
            <div className="hero-photo"></div>
            <div className="floating-card card-producer">
              <span className="avatar">AV</span>
              <div>
                <strong>AndesVerde</strong>
                <small>Concepción, Junín</small>
              </div>
              <span className="verified">✓</span>
            </div>
            <div className="floating-card card-order">
              <span className="mini-icon">✓</span>
              <div>
                <strong>Pago retenido</strong>
                <small>Se libera al agricultor tras la entrega</small>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="category-strip">
        <div className="container category-row">
          {[
            "Tubérculos",
            "Hortalizas",
            "Frutas",
            "Granos",
          ].map((label) => (
            <button
              key={label}
              onClick={() => {
                catalogo.setCategoria(label);
                catalogo.setSoloFavoritos(false);
                navigate("catalogo");
              }}
            >
              <span><CategoryIcon label={label} /></span>
              {label}
            </button>
          ))}
        </div>
      </section>
      <section className="section-block">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Cosecha reciente</span>
              <h2>Productos disponibles esta semana</h2>
            </div>
            <button className="text-link" onClick={() => navigate("catalogo")}>
              Ver catálogo completo →
            </button>
          </div>
          <div className="row g-4">
            {productos.slice(0, 4).map((producto) => (
              <div className="col-12 col-sm-6 col-lg-3" key={producto.id}>
                <ProductCard
                  producto={producto}
                  favorito={catalogo.idsFavoritos.has(producto.id)}
                  onAbrir={(id) => navigate("producto", id)}
                  onFavorito={async (id) => {
                    if (!(await catalogo.alternarFavorito(id)))
                      setToast("Inicia sesión para guardar tus productos favoritos.");
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="value-section" id="como-funciona">
        <div className="container">
          <div className="center-heading">
            <span className="eyebrow">Un proceso sencillo</span>
            <h2>Compra directo en cuatro pasos</h2>
            <p>Información clara para que productores y compradores coordinen mejor.</p>
          </div>
          <div className="steps-grid">
            {[
              ["01", "Explora", "Busca por producto, categoría o región."],
              ["02", "Compara", "Revisa precio, unidad, stock y origen."],
              ["03", "Solicita", "Agrupa productos de un mismo productor."],
              ["04", "Coordina", "Sigue el estado y acuerda pago y entrega."],
            ].map(([n, title, text]) => (
              <div className="step-card" key={n}>
                <span>{n}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="project-foundation">
        <div className="container">
          <div className="center-heading">
            <span className="eyebrow">Fundamento del proyecto</span>
            <h2>Una solución enfocada en coordinación y transparencia</h2>
            <p>
              El MVP valida primero la conexión comercial, antes de incorporar pagos o inteligencia
              artificial.
            </p>
          </div>
          <div className="foundation-grid">
            <article>
              <span>01</span>
              <h3>Problema</h3>
              <p>
                Pequeños productores tienen baja visibilidad y los compradores encuentran
                información dispersa sobre precio, stock, unidad y procedencia.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Misión</h3>
              <p>
                Facilitar una coordinación directa y clara entre productores peruanos y compradores
                locales mediante una plataforma accesible.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Visión</h3>
              <p>
                Ser una herramienta digital confiable para fortalecer circuitos cortos de
                comercialización agrícola en el Perú.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="impact-section">
        <div className="container impact-grid">
          <div>
            <span className="eyebrow light">Nuestra propuesta</span>
            <h2>Más visibilidad para quien produce. Más claridad para quien compra.</h2>
          </div>
          <div className="impact-stats">
            <div>
              <strong>{regiones || "—"}</strong>
              <span>regiones representadas</span>
            </div>
            <div>
              <strong>{productos.length || "—"}</strong>
              <span>productos disponibles</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>software y acceso gratuito</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
