"use client";

import { useEffect, useState } from "react";

import type { Formato, ProductoDetalle } from "@/types/api";
import * as reglas from "@/utils/carrito";
import type { ItemCarrito, ResultadoAgregar } from "@/utils/carrito";

/** El carrito es lo único (además del token) que se guarda en el navegador antes de confirmar el pedido. */
const CLAVE = "agrodirecto-carrito-v3";

function leer(): ItemCarrito[] {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as ItemCarrito[]) : [];
  } catch {
    return [];
  }
}

export function useCarrito() {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [hidratado, setHidratado] = useState(false);

  // Se lee después del primer render para que el HTML del servidor y el del navegador coincidan.
  useEffect(() => {
    const espera = window.setTimeout(() => {
      setItems(leer());
      setHidratado(true);
    }, 0);
    return () => window.clearTimeout(espera);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(items));
    } catch {
      // Sin almacenamiento disponible: el carrito vive solo mientras la pestaña esté abierta.
    }
  }, [hidratado, items]);

  const agregar = (
    producto: ProductoDetalle,
    formato: Formato,
    cantidad: number,
  ): ResultadoAgregar => {
    const resultado = reglas.agregar(items, reglas.itemDesde(producto, formato), cantidad);
    if (resultado.tipo === "agregado") setItems(resultado.items);
    return resultado;
  };

  /** Vacía el carrito y empieza uno nuevo con esta presentación (cuando era de otro productor). */
  const reemplazar = (producto: ProductoDetalle, formato: Formato, cantidad: number) => {
    const resultado = reglas.agregar([], reglas.itemDesde(producto, formato), cantidad);
    if (resultado.tipo === "agregado") setItems(resultado.items);
  };

  return {
    items,
    unidades: reglas.unidades(items),
    subtotal: reglas.subtotal(items),
    agregar,
    reemplazar,
    cambiarCantidad: (formatoId: number, cantidad: number) =>
      setItems((actual) => reglas.cambiarCantidad(actual, formatoId, cantidad)),
    quitar: (formatoId: number) => setItems((actual) => reglas.quitar(actual, formatoId)),
    vaciar: () => setItems([]),
  };
}

export type CarritoState = ReturnType<typeof useCarrito>;
