import { describe, expect, it } from "vitest";

import { agregar, cambiarCantidad, quitar, subtotal, unidades } from "@/utils/carrito";
import type { ItemCarrito } from "@/utils/carrito";
import { compararConMercado } from "@/utils/precio";

const saco = {
  formatoId: 1,
  productoId: 1,
  producto: "Papa amarilla",
  formato: "Saco de 50 kg",
  precio: 118,
  stock: 18,
  imagenUrl: null,
  productorId: 1,
  productor: "AndesVerde",
  region: "Junín",
};
const arroba = { ...saco, formatoId: 2, formato: "Arroba", precio: 32, stock: 40 };
const tomate = {
  ...saco,
  formatoId: 4,
  productoId: 2,
  producto: "Tomate",
  productorId: 2,
  productor: "ValleFresco",
};

function conItems(...lineas: [typeof saco, number][]): ItemCarrito[] {
  return lineas.map(([item, cantidad]) => ({ ...item, cantidad }));
}

describe("carrito por presentación", () => {
  it("agrega presentaciones del mismo productor y suma cantidades", () => {
    let r = agregar([], saco, 2);
    expect(r.tipo).toBe("agregado");
    r = agregar(r.tipo === "agregado" ? r.items : [], arroba, 1);
    r = agregar(r.tipo === "agregado" ? r.items : [], saco, 3);
    expect(r.tipo === "agregado" && r.items.map((i) => [i.formatoId, i.cantidad])).toEqual([
      [1, 5],
      [2, 1],
    ]);
  });

  it("no mezcla productores en un pedido (RN-01)", () => {
    expect(agregar(conItems([saco, 1]), tomate, 1)).toEqual({
      tipo: "otro-productor",
      productorActual: "AndesVerde",
    });
  });

  it("nunca supera el stock ni baja de 1", () => {
    const r = agregar(conItems([saco, 17]), saco, 5);
    expect(r.tipo === "agregado" && r.items[0].cantidad).toBe(18);
    expect(cambiarCantidad(conItems([saco, 3]), 1, 0)[0].cantidad).toBe(1);
    expect(cambiarCantidad(conItems([saco, 3]), 1, 99)[0].cantidad).toBe(18);
  });

  it("calcula unidades y subtotal referencial", () => {
    const items = conItems([saco, 2], [arroba, 1]);
    expect(unidades(items)).toBe(3);
    expect(subtotal(items)).toBe(268);
    expect(quitar(items, 1)).toHaveLength(1);
  });
});

describe("comparación con el precio de mercado", () => {
  const referencia = {
    id: 1,
    clave: "PAPA_AMARILLA",
    nombre: "Papa amarilla",
    precioMayoristaKg: 2.8,
    precioMinoristaKg: 4.5,
    fuente: "Referencial de demostración",
    fecha: "2026-11-01",
  };

  it("muestra el ahorro frente a la tienda y la posición frente al mayorista", () => {
    expect(compararConMercado(2.36, referencia)).toMatchObject({
      ahorroFrenteMinorista: 48,
      sobreMayorista: -16,
    });
    expect(compararConMercado(3.2, referencia)).toMatchObject({
      ahorroFrenteMinorista: 29,
      sobreMayorista: 14,
    });
  });

  it("no compara sin peso o sin referencia", () => {
    expect(compararConMercado(null, referencia)).toBeNull();
    expect(compararConMercado(2.5, null)).toBeNull();
  });
});
