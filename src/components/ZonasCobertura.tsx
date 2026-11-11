import type { Zona } from "@/types/api";
import { money } from "@/utils/format";

/**
 * Regiones a las que entrega el productor (RN-09) con días de viaje, pedido mínimo y flete.
 * Si se indica la vida útil, marca las regiones a las que el producto no llegaría fresco (RN-10).
 */
export function ZonasCobertura({
  zonas,
  vidaUtilDias,
}: {
  zonas: Zona[];
  vidaUtilDias?: number | null;
}) {
  return (
    <>
      <ul className="zonas">
        {zonas.map((z) => {
          const noLlega = vidaUtilDias != null && z.diasTransito >= vidaUtilDias;
          return (
            <li key={z.region} className={noLlega ? "no-llega" : ""}>
              <strong>{z.region}</strong>
              <span>
                {noLlega
                  ? `No llega fresco: el viaje toma ${z.diasTransito} días`
                  : `${z.diasTransito === 0 ? "En la misma región" : `${z.diasTransito} ${z.diasTransito === 1 ? "día" : "días"} de viaje`} · pedido mínimo ${money(z.pedidoMinimo)} · ${z.costoFlete > 0 ? `flete ${money(z.costoFlete)}` : "sin flete"}`}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="fuente">También puedes recogerlo en la chacra, sin flete ni pedido mínimo.</p>
    </>
  );
}
