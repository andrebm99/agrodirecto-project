"use client";

import { Icon } from "@/components/Icon";
import { ProductCard } from "@/components/ProductCard";
import type { EstadoApp } from "@/hooks/estadoApp";
import type { Orden } from "@/hooks/useCatalogo";

type Props = Pick<EstadoApp, "catalogo" | "navigate" | "setToast" | "usuario">;

const ORDENES: { valor: Orden; etiqueta: string }[] = [
  { valor: "", etiqueta: "Más relevantes" },
  { valor: "precio_asc", etiqueta: "Menor precio" },
  { valor: "precio_desc", etiqueta: "Mayor precio" },
  { valor: "cosecha", etiqueta: "Cosecha más reciente" },
];

export function Catalog({ catalogo, navigate, setToast, usuario }: Props) {
  const {
    busqueda,
    setBusqueda,
    categoria,
    setCategoria,
    atiende,
    setAtiende,
    soloOrganico,
    setSoloOrganico,
    orden,
    setOrden,
    soloFavoritos,
    setSoloFavoritos,
    productos,
    cargando,
    error,
    recargar,
    categorias,
    regiones,
    idsFavoritos,
    alternarFavorito,
    limpiarFiltros,
    hayFiltros,
  } = catalogo;

  const favorito = async (id: number) => {
    if (!(await alternarFavorito(id)))
      setToast("Inicia sesión para guardar tus productos favoritos.");
  };

  const contexto = soloFavoritos
    ? "Tus productos guardados"
    : atiende
      ? `De productores que entregan en ${atiende}`
      : "Precio fijo del agricultor · pago protegido hasta la entrega";

  return (
    <main>
      <section className="catalog-hero">
        <div className="container">
          <h1>Productos del campo</h1>
          <p>
            Compara precio, presentación y origen. Lo que pagas por el producto llega completo al
            agricultor.
          </p>
          <form className="catalog-search" role="search" onSubmit={(e) => e.preventDefault()}>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Busca papa, palta, café, un productor o una provincia"
              aria-label="Buscar productos"
            />
            <button type="submit">
              <Icon name="search" size={17} /> Buscar
            </button>
          </form>
        </div>
      </section>
      <section className="section-block">
        <div className="container">
          <div className="catalog-toolbar">
            <div className="filter-pills" role="group" aria-label="Categorías">
              <button
                className={!soloFavoritos && !categoria ? "active" : ""}
                aria-pressed={!soloFavoritos && !categoria}
                onClick={() => {
                  setCategoria("");
                  setSoloFavoritos(false);
                }}
              >
                Todos
              </button>
              {categorias.map((c) => (
                <button
                  key={c.id}
                  className={!soloFavoritos && categoria === c.nombre ? "active" : ""}
                  aria-pressed={!soloFavoritos && categoria === c.nombre}
                  onClick={() => {
                    setCategoria(c.nombre);
                    setSoloFavoritos(false);
                  }}
                >
                  {c.nombre}
                </button>
              ))}
              {usuario ? (
                <button
                  className={soloFavoritos ? "active" : ""}
                  aria-pressed={soloFavoritos}
                  onClick={() => setSoloFavoritos(!soloFavoritos)}
                >
                  <Icon name="heart" size={14} fill={soloFavoritos ? "currentColor" : "none"} />{" "}
                  Favoritos ({idsFavoritos.size})
                </button>
              ) : null}
            </div>
            <div className="filtros-secundarios">
              <label className="filtro-region">
                Entrega en
                <select
                  className="form-select"
                  value={atiende}
                  onChange={(e) => setAtiende(e.target.value)}
                >
                  <option value="">Todo el Perú</option>
                  {regiones.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="filtro-region">
                Ordenar por
                <select
                  className="form-select"
                  value={orden}
                  onChange={(e) => setOrden(e.target.value as Orden)}
                >
                  {ORDENES.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.etiqueta}
                    </option>
                  ))}
                </select>
              </label>
              <label className="check-line filtro-organico">
                <input
                  type="checkbox"
                  checked={soloOrganico}
                  onChange={(e) => setSoloOrganico(e.target.checked)}
                />
                Solo orgánicos
              </label>
            </div>
          </div>

          <div className="results-line" aria-live="polite">
            <strong>
              {cargando && !productos.length
                ? "Buscando…"
                : `${productos.length} ${productos.length === 1 ? "producto" : "productos"}`}
            </strong>
            <span>{contexto}</span>
          </div>

          {error ? (
            <div className="aviso aviso-error" role="alert">
              <Icon name="warning" size={18} />
              <span>
                {error}{" "}
                <button className="enlace-texto" onClick={recargar}>
                  Reintentar
                </button>
              </span>
            </div>
          ) : cargando && !productos.length ? (
            <div className="row g-4" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => (
                <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={i}>
                  <div className="tarjeta-esqueleto" />
                </div>
              ))}
            </div>
          ) : productos.length ? (
            <div className={`row g-4 ${cargando ? "actualizando" : ""}`} aria-busy={cargando}>
              {productos.map((producto) => (
                <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={producto.id}>
                  <ProductCard
                    producto={producto}
                    favorito={idsFavoritos.has(producto.id)}
                    onAbrir={(id) => navigate("producto", id)}
                    onFavorito={favorito}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon">
                <Icon name="search" size={30} />
              </span>
              <h2>{soloFavoritos ? "Aún no guardas productos" : "No encontramos coincidencias"}</h2>
              <p>
                {soloFavoritos
                  ? "Toca el corazón de un producto para tenerlo a mano en tu próximo pedido."
                  : atiende
                    ? `Ningún productor con esos filtros entrega en ${atiende}. Prueba con otra región o con recojo en chacra.`
                    : "Prueba con otra palabra o quita algunos filtros."}
              </p>
              {hayFiltros ? (
                <button className="btn btn-brand" onClick={limpiarFiltros}>
                  Quitar filtros
                </button>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
