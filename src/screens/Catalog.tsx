"use client";

import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import { ProductCard } from "@/components/ProductCard";
import { Icon } from "@/components/Icon";

export function Catalog({
  search,
  setSearch,
  favoritesOnly,
  category,
  setCategory,
  setFavoritesOnly,
  favorites,
  sort,
  setSort,
  filteredProducts,
  navigate,
  addToCart,
  toggleFavorite,
}: Pick<
  AgroDirectoState,
  | "search"
  | "setSearch"
  | "favoritesOnly"
  | "category"
  | "setCategory"
  | "setFavoritesOnly"
  | "favorites"
  | "sort"
  | "setSort"
  | "filteredProducts"
  | "navigate"
  | "addToCart"
  | "toggleFavorite"
>) {
  return (
    <main>
      <section className="catalog-hero">
        <div className="container">
          <span className="eyebrow light">Compra local</span>
          <h1>Productos agrícolas disponibles</h1>
          <p>Consulta precio, unidad, stock y origen antes de enviar tu solicitud.</p>
          <div className="catalog-search">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar papa, palta, café o productor…"
              aria-label="Buscar productos"
            />
            <button aria-label="Buscar"><Icon name="search" size={17} /> Buscar</button>
          </div>
        </div>
      </section>
      <section className="section-block">
        <div className="container">
          <div className="catalog-toolbar">
            <div className="filter-pills">
              {["Todos", "Tubérculos", "Hortalizas", "Frutas", "Granos"].map((item) => (
                <button
                  key={item}
                  className={!favoritesOnly && category === item ? "active" : ""}
                  onClick={() => {
                    setCategory(item);
                    setFavoritesOnly(false);
                  }}
                >
                  {item}
                </button>
              ))}
              {favorites.length ? (
                <button
                  className={favoritesOnly ? "active" : ""}
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                >
                  ♥ Favoritos ({favorites.length})
                </button>
              ) : null}
            </div>
            <select
              className="form-select sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Ordenar productos"
            >
              <option value="relevancia">Más relevantes</option>
              <option value="menor">Menor precio</option>
              <option value="mayor">Mayor precio</option>
            </select>
          </div>
          <div className="results-line">
            <strong>{filteredProducts.length} productos</strong>
            <span>
              {favoritesOnly
                ? "Tus productos guardados"
                : "Precios referenciales · sin pago en línea"}
            </span>
          </div>
          {filteredProducts.length ? (
            <div className="row g-4">
              {filteredProducts.map((product) => (
                <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={product.id}>
                  <ProductCard
                    product={product}
                    onOpen={(id) => navigate("producto", id)}
                    onAdd={addToCart}
                    onFavorite={toggleFavorite}
                    favorite={favorites.includes(product.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>⌕</span>
              <h2>No encontramos coincidencias</h2>
              <p>Prueba con otra palabra o elimina los filtros.</p>
              <button
                className="btn btn-brand"
                onClick={() => {
                  setSearch("");
                  setCategory("Todos");
                  setFavoritesOnly(false);
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
