"use client";

import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import { PRODUCT_IMAGE_PRESETS } from "@/data/products";
import { LeafletMap } from "@/components/LeafletMap";

export function ProductForm({
  editingProductId,
  products,
  navigate,
  handleProduct,
  productImage,
  setProductImage,
  handleProductImage,
  saveDraft,
}: Pick<
  AgroDirectoState,
  | "editingProductId"
  | "products"
  | "navigate"
  | "handleProduct"
  | "productImage"
  | "setProductImage"
  | "handleProductImage"
  | "saveDraft"
>) {
  const editingProduct = editingProductId
    ? products.find((product) => product.id === editingProductId)
    : undefined;
  return (
    <main className="content-page">
      <div className="container">
        <button className="back-link" onClick={() => navigate("productor")}>
          ← Volver al panel
        </button>
        <div className="page-title compact">
          <span className="eyebrow">AndesVerde</span>
          <h1>{editingProduct ? "Editar producto" : "Publicar producto"}</h1>
          <p>
            {editingProduct
              ? "Actualiza la información y conserva una unidad de venta clara."
              : "Registra una unidad de venta clara para evitar confusiones."}
          </p>
        </div>
        <form
          key={editingProduct?.id ?? "new"}
          className="product-form-grid"
          onSubmit={handleProduct}
        >
          <section className="surface-card form-card">
            <h2>Información del producto</h2>
            <div className="row g-3">
              <div className="col-md-8">
                <label>
                  Nombre del producto
                  <input
                    className="form-control"
                    name="name"
                    required
                    defaultValue={editingProduct?.name ?? ""}
                    placeholder="Ej. Papa huayro seleccionada"
                  />
                </label>
              </div>
              <div className="col-md-4">
                <label>
                  Categoría
                  <select
                    className="form-select"
                    name="category"
                    required
                    defaultValue={editingProduct?.category ?? "Tubérculos"}
                  >
                    <option>Tubérculos</option>
                    <option>Hortalizas</option>
                    <option>Frutas</option>
                    <option>Granos</option>
                  </select>
                </label>
              </div>
              <div className="col-12">
                <label>
                  Descripción
                  <textarea
                    className="form-control"
                    name="description"
                    required
                    minLength={30}
                    defaultValue={editingProduct?.description ?? ""}
                    placeholder="Describe origen, calidad y uso recomendado."
                  />
                </label>
              </div>
              <div className="col-md-4">
                <label>
                  Unidad de venta
                  <select
                    className="form-select"
                    name="unit"
                    required
                    defaultValue={editingProduct?.unit ?? "Saco de 50 kg"}
                  >
                    <option>Saco de 50 kg</option>
                    <option>Saco de 30 kg</option>
                    <option>Saco de 25 kg</option>
                    <option>Caja de 20 kg</option>
                    <option>Caja de 10 kg</option>
                    <option>Jaba de 18 kg</option>
                    <option>Bolsa de 1 kg</option>
                    <option>Bolsa de 500 g</option>
                    <option>Racimo</option>
                  </select>
                </label>
              </div>
              <div className="col-md-4">
                <label>
                  Precio referencial
                  <input
                    className="form-control"
                    name="price"
                    type="number"
                    min="1"
                    step="0.10"
                    required
                    defaultValue={editingProduct?.price || ""}
                    placeholder="0.00"
                  />
                </label>
              </div>
              <div className="col-md-4">
                <label>
                  Stock
                  <input
                    className="form-control"
                    name="stock"
                    type="number"
                    min="1"
                    required
                    defaultValue={editingProduct?.stock || ""}
                    placeholder="0"
                  />
                </label>
              </div>
              <div className="col-12">
                <label className="check-line">
                  <input type="checkbox" name="organic" defaultChecked={editingProduct?.organic} />{" "}
                  Producto con certificación orgánica demostrable
                </label>
              </div>
            </div>
            <div className="product-image-editor">
              <div className="product-image-preview">
                <img src={productImage} alt="Vista previa del producto" />
              </div>
              <div>
                <strong>Fotografía del producto</strong>
                <p>
                  Selecciona una imagen del catálogo visual o carga una fotografía de hasta 5 MB. Se
                  optimizará y guardará únicamente en este dispositivo.
                </p>
                <div className="image-preset-row">
                  {PRODUCT_IMAGE_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.value}
                      className={productImage === preset.value ? "active" : ""}
                      onClick={() => setProductImage(preset.value)}
                      title={preset.label}
                    >
                      <img src={preset.value} alt={preset.label} />
                    </button>
                  ))}
                </div>
                <label className="btn btn-soft product-image-trigger">
                  Seleccionar fotografía
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleProductImage}
                  />
                </label>
              </div>
            </div>
          </section>
          <aside>
            <section className="surface-card location-card">
              <span className="eyebrow">Origen del productor</span>
              <h2>Concepción, Junín</h2>
              <p>
                La ubicación proviene del perfil de AndesVerde y se mostrará de forma aproximada.
              </p>
              <LeafletMap lat={-11.917} lng={-75.314} label="AndesVerde" />
            </section>
            <section className="surface-card publish-actions">
              <div>
                <strong>{editingProduct ? "Cambios preparados" : "Vista previa lista"}</strong>
                <span>Puedes publicar ahora o conservarlo como borrador local.</span>
              </div>
              <button className="btn btn-brand btn-lg w-100" type="submit">
                {editingProduct ? "Guardar y publicar" : "Publicar producto"}
              </button>
              <button
                className="btn btn-soft w-100"
                type="button"
                onClick={(event) =>
                  saveDraft(event.currentTarget.closest("form") as HTMLFormElement | null)
                }
              >
                Guardar borrador
              </button>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}
