"use client";

import { useState } from "react";

import { Icon } from "@/components/Icon";
import { LeafletMap } from "@/components/LeafletMap";
import { Reputacion } from "@/components/Reputacion";
import { ZonasCobertura } from "@/components/ZonasCobertura";
import type { EstadoApp } from "@/hooks/estadoApp";
import { useConsulta } from "@/hooks/useConsulta";
import { catalogoApi, confianzaApi } from "@/services/api";
import type { Formato, ProductoDetalle } from "@/types/api";
import { fecha, money } from "@/utils/format";
import { compararConMercado } from "@/utils/precio";

type Props = Pick<
  EstadoApp,
  "navigate" | "selectedProductId" | "catalogo" | "carrito" | "setToast"
>;

export function ProductDetail({ navigate, selectedProductId, catalogo, carrito, setToast }: Props) {
  const consulta = useConsulta(`producto:${selectedProductId}`, (signal) =>
    catalogoApi.detalle(selectedProductId, signal),
  );

  if (consulta.error) {
    return (
      <main className="content-page">
        <div className="container narrow-container page-title">
          <h1>No encontramos este producto</h1>
          <p>
            Puede que el productor lo haya retirado. Revisa el catálogo para ver lo que está
            disponible hoy.
          </p>
          <button className="btn btn-brand btn-lg mt-4" onClick={() => navigate("catalogo")}>
            Ir al catálogo
          </button>
        </div>
      </main>
    );
  }
  if (!consulta.datos) {
    return (
      <main className="cargando-pantalla" aria-busy="true">
        Cargando producto…
      </main>
    );
  }
  return (
    <Ficha
      key={consulta.datos.id}
      producto={consulta.datos}
      navigate={navigate}
      catalogo={catalogo}
      carrito={carrito}
      setToast={setToast}
    />
  );
}

function Ficha({
  producto,
  navigate,
  catalogo,
  carrito,
  setToast,
}: Omit<Props, "selectedProductId"> & { producto: ProductoDetalle }) {
  const disponibles = producto.formatos.filter((f) => f.disponible);
  const [formatoId, setFormatoId] = useState<number | null>(
    (disponibles[0] ?? producto.formatos[0])?.id ?? null,
  );
  const [cantidad, setCantidad] = useState(1);
  const [conflicto, setConflicto] = useState<string | null>(null);
  const reputacion = useConsulta(`reputacion:${producto.productor.id}`, (signal) =>
    confianzaApi.reputacion(producto.productor.id, signal),
  );

  const formato: Formato | undefined = producto.formatos.find((f) => f.id === formatoId);
  const comparacion = compararConMercado(formato?.precioPorKg ?? null, producto.precioReferencia);
  const favorito = catalogo.idsFavoritos.has(producto.id);
  const productor = producto.productor;

  const agregar = () => {
    if (!formato) return;
    const resultado = carrito.agregar(producto, formato, cantidad);
    if (resultado.tipo === "otro-productor") {
      setConflicto(resultado.productorActual);
      return;
    }
    setToast(`Agregaste ${cantidad} × ${formato.nombre} de ${producto.nombre}.`);
  };

  return (
    <main className="content-page">
      <div className="container">
        <nav className="breadcrumb-line" aria-label="Ruta">
          <button onClick={() => navigate("catalogo")}>Catálogo</button>
          <span>/</span>
          <span>{producto.categoria}</span>
          <span>/</span>
          <strong aria-current="page">{producto.nombre}</strong>
        </nav>

        <div className="product-detail-grid">
          <div className="detail-image-wrap">
            <img src={producto.imagenUrl ?? "/images/hero-market.jpg"} alt={producto.nombre} />
            {producto.organico ? <span className="organic-tag">Producción orgánica</span> : null}
          </div>

          <div className="detail-content">
            <div className="detail-title-row">
              <span className="category-label">{producto.categoria}</span>
              <button
                className={`detail-favorite ${favorito ? "is-favorite" : ""}`}
                onClick={async () => {
                  if (!(await catalogo.alternarFavorito(producto.id)))
                    setToast("Inicia sesión para guardar tus productos favoritos.");
                }}
                aria-pressed={favorito}
              >
                <Icon name="heart" size={16} fill={favorito ? "currentColor" : "none"} />
                {favorito ? "Guardado" : "Guardar"}
              </button>
            </div>
            <h1>{producto.nombre}</h1>
            <p className="ficha-productor">
              De{" "}
              <button className="enlace-texto" onClick={() => navigate("perfil", productor.id)}>
                {productor.nombreComercial}
              </button>{" "}
              · {productor.provincia}, {productor.region}
            </p>
            {producto.descripcion ? (
              <p className="detail-description">{producto.descripcion}</p>
            ) : null}

            <fieldset className="formatos">
              <legend>Elige la presentación</legend>
              {producto.formatos.map((f) => (
                <label
                  key={f.id}
                  className={`formato ${f.id === formatoId ? "elegido" : ""} ${f.disponible ? "" : "sin-stock"}`}
                >
                  <input
                    type="radio"
                    name="formato"
                    value={f.id}
                    checked={f.id === formatoId}
                    disabled={!f.disponible}
                    onChange={() => {
                      setFormatoId(f.id);
                      setCantidad(1);
                      setConflicto(null);
                    }}
                  />
                  <span className="formato-nombre">{f.nombre}</span>
                  <span className="formato-precio">{money(f.precio)}</span>
                  <span className="formato-detalle">
                    {f.precioPorKg !== null ? `${money(f.precioPorKg)} por kg · ` : ""}
                    {f.disponible ? `${f.stock} disponibles` : "Agotado"}
                    {f.descuento
                      ? ` · ${f.descuento.porcentaje}% menos desde ${f.descuento.desdeCantidad}`
                      : ""}
                  </span>
                </label>
              ))}
            </fieldset>

            {formato ? (
              <div className="quantity-row">
                <div className="quantity-control">
                  <button
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    aria-label="Reducir cantidad"
                  >
                    <Icon name="minus" size={16} />
                  </button>
                  <span aria-live="polite">{cantidad}</span>
                  <button
                    onClick={() => setCantidad(Math.min(formato.stock, cantidad + 1))}
                    aria-label="Aumentar cantidad"
                  >
                    <Icon name="plus" size={16} />
                  </button>
                </div>
                <button
                  className="btn btn-brand btn-lg flex-grow-1"
                  disabled={!formato.disponible}
                  onClick={agregar}
                >
                  {formato.disponible ? `Agregar · ${money(formato.precio * cantidad)}` : "Agotado"}
                </button>
              </div>
            ) : null}

            {conflicto ? (
              <div className="aviso aviso-atencion" role="alert">
                <Icon name="info" size={18} />
                <div>
                  <p className="mb-2">
                    Tu carrito tiene productos de <strong>{conflicto}</strong>. Cada pedido es con
                    un solo productor, así la entrega y la responsabilidad quedan claras.
                  </p>
                  <div className="acciones-fila mb-0">
                    <button className="btn btn-claro" onClick={() => navigate("carrito")}>
                      Terminar ese pedido primero
                    </button>
                    <button
                      className="btn btn-claro"
                      onClick={() => {
                        if (!formato) return;
                        carrito.reemplazar(producto, formato, cantidad);
                        setConflicto(null);
                        setToast(`Empezaste un pedido nuevo con ${productor.nombreComercial}.`);
                      }}
                    >
                      Vaciar carrito y agregar este
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <section className="precio-justo" aria-labelledby="titulo-precio-justo">
              <h2 id="titulo-precio-justo">Precio justo</h2>
              {comparacion ? (
                <p>
                  Pagas <strong>{money(comparacion.precioPorKg)} por kg</strong>. En el mercado,
                  este producto cuesta {money(comparacion.mayoristaKg)} al por mayor y{" "}
                  {money(comparacion.minoristaKg)} en tienda
                  {comparacion.ahorroFrenteMinorista > 0
                    ? `: ${comparacion.ahorroFrenteMinorista}% menos que en tienda.`
                    : "."}
                </p>
              ) : null}
              <p>
                {productor.nombreComercial} recibe este precio completo. El servicio de AgroDirecto
                (5%) lo paga quien compra y verás el detalle antes de confirmar.
              </p>
              {producto.precioReferencia ? (
                <p className="fuente">
                  Referencia de mercado: {producto.precioReferencia.fuente},{" "}
                  {fecha(producto.precioReferencia.fecha)}.
                </p>
              ) : null}
            </section>

            <dl className="datos-producto">
              {producto.fechaCosecha ? (
                <div>
                  <dt>Cosecha</dt>
                  <dd>{fecha(producto.fechaCosecha)}</dd>
                </div>
              ) : null}
              {producto.vidaUtilDias ? (
                <div>
                  <dt>Se conserva</dt>
                  <dd>{producto.vidaUtilDias} días</dd>
                </div>
              ) : null}
              {producto.calibre ? (
                <div>
                  <dt>Calibre</dt>
                  <dd>{producto.calibre}</dd>
                </div>
              ) : null}
              <div>
                <dt>Comprobante</dt>
                <dd>{productor.emiteFactura ? "Factura o boleta" : "Boleta"}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="detail-lower-grid">
          <section className="surface-card producer-card">
            <div className="producer-header">
              <span className="avatar large" aria-hidden="true">
                {productor.nombreComercial.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <h2>{productor.nombreComercial}</h2>
                <p>
                  {productor.nombreTitular} · {productor.provincia}, {productor.region}
                </p>
              </div>
            </div>
            <Reputacion
              verificado={productor.verificado}
              reputacion={reputacion.datos}
              asociacion={productor.asociacion?.nombre}
            />
            {productor.historia ? <p className="historia">{productor.historia}</p> : null}
            <button className="btn btn-claro" onClick={() => navigate("perfil", productor.id)}>
              Conoce a {productor.nombreComercial} <Icon name="arrow-right" size={16} />
            </button>
          </section>
          <section className="surface-card map-card">
            <div>
              <h2>¿Llega a tu negocio?</h2>
              <ZonasCobertura zonas={productor.zonas} vidaUtilDias={producto.vidaUtilDias} />
            </div>
            {productor.latitud !== null && productor.longitud !== null ? (
              <>
                <LeafletMap
                  lat={productor.latitud}
                  lng={productor.longitud}
                  label={productor.nombreComercial}
                />
                <p className="fuente">
                  Ubicación aproximada de la chacra. La dirección exacta nunca se publica.
                </p>
              </>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
