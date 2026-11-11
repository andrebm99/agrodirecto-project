import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import type { CarritoState } from "@/hooks/useCarrito";
import type { CatalogoState } from "@/hooks/useCatalogo";
import type { GestionState } from "@/hooks/useGestion";

/**
 * Estado que reciben las pantallas: el de las pantallas aún en demostración (useAgroDirecto)
 * más los módulos ya conectados a la API.
 */
export type EstadoApp = AgroDirectoState & {
  catalogo: CatalogoState;
  carrito: CarritoState;
  gestion: GestionState;
};
