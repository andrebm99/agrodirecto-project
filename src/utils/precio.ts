import type { PrecioReferencia } from "@/types/api";

export interface ComparacionMercado {
  precioPorKg: number;
  mayoristaKg: number;
  minoristaKg: number;
  /** Cuánto menos que en la tienda (precio minorista), en %. Negativo si es más caro. */
  ahorroFrenteMinorista: number;
  /** Cuánto recibe el agricultor por encima del precio mayorista, en %. Negativo si está por debajo. */
  sobreMayorista: number;
}

/** RN-A2: compara el precio por kg con el mercado para que el comprador vea que es justo. */
export function compararConMercado(
  precioPorKg: number | null,
  referencia: PrecioReferencia | null,
): ComparacionMercado | null {
  if (precioPorKg === null || !referencia) return null;
  return {
    precioPorKg,
    mayoristaKg: referencia.precioMayoristaKg,
    minoristaKg: referencia.precioMinoristaKg,
    ahorroFrenteMinorista: Math.round((1 - precioPorKg / referencia.precioMinoristaKg) * 100),
    sobreMayorista: Math.round((precioPorKg / referencia.precioMayoristaKg - 1) * 100),
  };
}
