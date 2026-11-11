"use client";

import { Icon } from "@/components/Icon";
import { LeafletMap } from "@/components/LeafletMap";
import { ProductCard } from "@/components/ProductCard";
import { Reputacion } from "@/components/Reputacion";
import { ZonasCobertura } from "@/components/ZonasCobertura";
import type { EstadoApp } from "@/hooks/estadoApp";
import { useConsulta } from "@/hooks/useConsulta";
import { catalogoApi, confianzaApi, productoresApi } from "@/services/api";
import { fecha } from "@/utils/format";

type Props = Pick<EstadoApp, "navigate" | "selectedProductId" | "catalogo" | "setToast">;

/** Perfil público del productor: historia, prácticas, reputación, reseñas verificadas y sus productos. */
export function PerfilProductor({ navigate, selectedProductId: id, catalogo, setToast }: Props) {
  const perfil = useConsulta(`perfil:${id}`, (signal) => productoresApi.detalle(id, signal));
  const reputacion = useConsulta(`reputacion:${id}`, (signal) =>
    confianzaApi.reputacion(id, signal),
  );
  const resenas = useConsulta(`resenas:${id}`, (signal) => confianzaApi.resenas(id, signal));
  const productos = useConsulta(`productos-de:${id}`, (signal) =>
    catalogoApi.buscar({ productorId: id }, signal),
  );

  if (perfil.error) {
    return (
      <main className="content-page">
        <div className="container narrow-container page-title">
          <h1>No encontramos a este productor</h1>
          <p>Revisa el directorio para ver quiénes venden hoy en AgroDirecto.</p>
          <button className="btn btn-brand btn-lg mt-4" onClick={() => navigate("productores")}>
            Ver productores
          </button>
        </div>
      </main>
    );
  }
  const p = perfil.datos;
  if (!p) {
    return (
      <main className="cargando-pantalla" aria-busy="true">
        Cargando perfil…
      </main>
    );
  }

  return (
    <main className="content-page">
      <div className="container">
        <button className="back-link" onClick={() => navigate("productores")}>
          ← Todos los productores
        </button>
        <div className="perfil-grid">
          <section className="surface-card producer-card">
            <div className="producer-header">
              <span className="avatar large" aria-hidden="true">
                {p.nombreComercial.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <h1 className="perfil-nombre">{p.nombreComercial}</h1>
                <p>
                  {p.nombreTitular} · {p.distrito ? `${p.distrito}, ` : ""}
                  {p.provincia}, {p.region}
                </p>
              </div>
            </div>
            <Reputacion
              verificado={p.verificado}
              reputacion={reputacion.datos}
              asociacion={p.asociacion?.nombre}
            />
            {p.historia ? (
              <>
                <h2 className="subtitulo">Su historia</h2>
                <p className="historia">{p.historia}</p>
              </>
            ) : null}
            {p.practicas ? (
              <>
                <h2 className="subtitulo">Cómo cultiva</h2>
                <p className="historia">{p.practicas}</p>
              </>
            ) : null}
          </section>
          <section className="surface-card map-card">
            <div>
              <h2>Entregas</h2>
              <ZonasCobertura zonas={p.zonas} />
            </div>
            {p.latitud !== null && p.longitud !== null ? (
              <LeafletMap lat={p.latitud} lng={p.longitud} label={p.nombreComercial} />
            ) : null}
          </section>
        </div>

        <section className="section-block pb-0">
          <h2 className="titulo-seccion">Productos de {p.nombreComercial}</h2>
          {productos.datos?.length ? (
            <div className="row g-4">
              {productos.datos.map((producto) => (
                <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={producto.id}>
                  <ProductCard
                    producto={producto}
                    favorito={catalogo.idsFavoritos.has(producto.id)}
                    onAbrir={(productoId) => navigate("producto", productoId)}
                    onFavorito={async (productoId) => {
                      if (!(await catalogo.alternarFavorito(productoId)))
                        setToast("Inicia sesión para guardar tus productos favoritos.");
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">
              {productos.cargando ? "Cargando productos…" : "Hoy no tiene productos publicados."}
            </p>
          )}
        </section>

        <section className="section-block pb-0">
          <h2 className="titulo-seccion">Lo que dicen sus compradores</h2>
          {resenas.datos?.length ? (
            <ul className="resenas">
              {resenas.datos.map((r) => (
                <li key={r.id} className="surface-card">
                  <p className="estrellas" aria-label={`${r.calificacion} de 5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Icon
                        key={i}
                        name="star"
                        size={15}
                        fill={i < r.calificacion ? "currentColor" : "none"}
                      />
                    ))}
                  </p>
                  {r.comentario ? <p>{r.comentario}</p> : null}
                  <small>
                    {r.autor} · pedido {r.pedido} · {fecha(r.creadoEn)}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">
              Todavía no tiene reseñas. Solo pueden opinar quienes le compraron y recibieron su
              pedido.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
