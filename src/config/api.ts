/**
 * Dirección del backend. Se define en `.env.local` (desarrollo) o en las variables del despliegue:
 *   VITE_API_URL=https://agrodirecto-backend.onrender.com
 */
const desdeEntorno = (import.meta.env?.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

export const API_URL = desdeEntorno || "http://localhost:8080";

/** WebSocket (STOMP): misma dirección con ws:// o wss://. */
export const WS_URL = `${API_URL.replace(/^http/, "ws")}/ws`;
