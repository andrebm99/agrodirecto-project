import type { Formato, ProductoDetalle } from "@/types/api";

/**
 * Línea del carrito: una presentación concreta (p. ej. "Saco de 50 kg") con los datos necesarios para
 * mostrarla sin volver a consultar. El precio es referencial: el servidor recalcula todo al cotizar.
 */
export interface ItemCarrito {
  formatoId: number;
  productoId: number;
  producto: string;
  formato: string;
  precio: number;
  stock: number;
  imagenUrl: string | null;
  productorId: number;
  productor: string;
  region: string;
  cantidad: number;
}

export type ResultadoAgregar =
  { tipo: "agregado"; items: ItemCarrito[] } | { tipo: "otro-productor"; productorActual: string };

export function itemDesde(
  producto: ProductoDetalle,
  formato: Formato,
): Omit<ItemCarrito, "cantidad"> {
  return {
    formatoId: formato.id,
    productoId: producto.id,
    producto: producto.nombre,
    formato: formato.nombre,
    precio: formato.precio,
    stock: formato.stock,
    imagenUrl: producto.imagenUrl,
    productorId: producto.productor.id,
    productor: producto.productor.nombreComercial,
    region: producto.productor.region,
  };
}

/** RN-01: un pedido agrupa productos de un solo productor. La cantidad nunca supera el stock. */
export function agregar(
  items: ItemCarrito[],
  nuevo: Omit<ItemCarrito, "cantidad">,
  cantidad: number,
): ResultadoAgregar {
  if (items.length && items[0].productorId !== nuevo.productorId) {
    return { tipo: "otro-productor", productorActual: items[0].productor };
  }
  const existente = items.find((item) => item.formatoId === nuevo.formatoId);
  if (existente) {
    return {
      tipo: "agregado",
      items: items.map((item) =>
        item.formatoId === nuevo.formatoId
          ? { ...item, ...nuevo, cantidad: Math.min(nuevo.stock, item.cantidad + cantidad) }
          : item,
      ),
    };
  }
  return {
    tipo: "agregado",
    items: [...items, { ...nuevo, cantidad: Math.min(nuevo.stock, cantidad) }],
  };
}

export function cambiarCantidad(
  items: ItemCarrito[],
  formatoId: number,
  cantidad: number,
): ItemCarrito[] {
  return items.map((item) =>
    item.formatoId === formatoId
      ? { ...item, cantidad: Math.max(1, Math.min(item.stock, cantidad)) }
      : item,
  );
}

export function quitar(items: ItemCarrito[], formatoId: number): ItemCarrito[] {
  return items.filter((item) => item.formatoId !== formatoId);
}

export function unidades(items: ItemCarrito[]): number {
  return items.reduce((total, item) => total + item.cantidad, 0);
}

/** Subtotal referencial, sin descuento por volumen ni flete: el desglose exacto lo da la cotización. */
export function subtotal(items: ItemCarrito[]): number {
  return (
    Math.round(items.reduce((total, item) => total + item.precio * item.cantidad, 0) * 100) / 100
  );
}
