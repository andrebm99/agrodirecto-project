"use client";

import { Icon } from "@/components/Icon";
import { useConsulta } from "@/hooks/useConsulta";
import { notificacionesApi } from "@/services/api";
import { fecha } from "@/utils/format";

/** SMS y WhatsApp enviados al agricultor (RN-B2). El agente puede reenviarlos gratis desde su WhatsApp. */
export function MensajesProductor({ productorId }: { productorId: number }) {
  const consulta = useConsulta(`mensajes:${productorId}`, () =>
    notificacionesApi.mensajesDelProductor(productorId),
  );
  const mensajes = (consulta.datos ?? []).filter((m) => m.canal === "WHATSAPP");
  if (consulta.cargando && !consulta.datos) return <p className="text-muted">Cargando mensajes…</p>;
  if (!mensajes.length)
    return (
      <p className="text-muted">
        Aún no hay mensajes. Cuando llegue un pedido pagado, el agricultor recibirá un SMS.
      </p>
    );
  return (
    <ul className="lista-mensajes">
      {mensajes.map((m) => (
        <li key={m.id}>
          <p>{m.mensaje}</p>
          <div className="acciones-fila mb-0">
            <small className="text-muted">
              Enviado por SMS al {m.destino} · {fecha(m.creadaEn)}
            </small>
            {m.enlace ? (
              <a
                className="btn btn-claro"
                href={m.enlace}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="arrow-right" size={16} /> Reenviar por WhatsApp
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
