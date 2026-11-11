import { Icon } from "@/components/Icon";
import type { Reputacion as ReputacionApi } from "@/types/api";

interface Props {
  verificado: boolean;
  reputacion?: ReputacionApi;
  asociacion?: string | null;
}

/** RN-21: reputación con hechos (no con estrellas inventadas) y verificación presencial real. */
export function Reputacion({ verificado, reputacion, asociacion }: Props) {
  return (
    <ul className="hechos-productor">
      <li className={verificado ? "positivo" : ""}>
        <Icon name={verificado ? "check" : "info"} size={16} />
        {verificado ? "Identidad verificada en persona" : "Verificación en persona pendiente"}
      </li>
      {reputacion ? (
        <li className={reputacion.nivel === "CONFIABLE" ? "positivo" : ""}>
          <Icon name="sprout" size={16} />
          {reputacion.nivel === "NUEVO" ? "Nuevo en AgroDirecto" : reputacion.descripcion}
        </li>
      ) : null}
      {reputacion && reputacion.totalResenas > 0 && reputacion.promedio !== null ? (
        <li>
          <Icon name="star" size={16} />
          {reputacion.promedio.toFixed(1)} de 5 · {reputacion.totalResenas}{" "}
          {reputacion.totalResenas === 1 ? "reseña" : "reseñas"} de compradores
        </li>
      ) : null}
      {asociacion ? (
        <li>
          <Icon name="user" size={16} />
          Socio de {asociacion}
        </li>
      ) : null}
    </ul>
  );
}
