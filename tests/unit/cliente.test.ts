import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_URL } from "@/config/api";
import { ApiError, api, consulta } from "@/services/api/cliente";
import { EVENTO_SESION_EXPIRADA, guardarToken, leerToken } from "@/services/api/sesion";

/** Almacenamiento en memoria para simular sessionStorage/localStorage en Node. */
function almacen(): Storage {
  const datos = new Map<string, string>();
  return {
    get length() {
      return datos.size;
    },
    clear: () => datos.clear(),
    getItem: (k) => datos.get(k) ?? null,
    key: (i) => [...datos.keys()][i] ?? null,
    removeItem: (k) => void datos.delete(k),
    setItem: (k, v) => void datos.set(k, v),
  };
}

function respuesta(estado: number, cuerpo?: unknown) {
  return new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), { status: estado });
}

describe("cliente de la API", () => {
  let eventos: EventTarget;
  let fetchSimulado: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    eventos = new EventTarget();
    vi.stubGlobal(
      "window",
      Object.assign(eventos, { sessionStorage: almacen(), localStorage: almacen() }),
    );
    fetchSimulado = vi.fn();
    vi.stubGlobal("fetch", fetchSimulado);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("envía el token guardado como Bearer", async () => {
    guardarToken("abc.def.ghi", false);
    fetchSimulado.mockResolvedValue(respuesta(200, { id: 1 }));

    await api.get("/api/auth/yo");

    const [url, opciones] = fetchSimulado.mock.calls[0];
    expect(url).toBe(`${API_URL}/api/auth/yo`);
    expect(opciones.headers.Authorization).toBe("Bearer abc.def.ghi");
  });

  it("no envía el token en peticiones públicas", async () => {
    guardarToken("abc", true);
    fetchSimulado.mockResolvedValue(respuesta(200, []));
    await api.get("/api/productos", { sinToken: true });
    expect(fetchSimulado.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("traduce el error del backend con su regla de negocio", async () => {
    fetchSimulado.mockResolvedValue(
      respuesta(422, {
        estado: 422,
        regla: "RN-01",
        mensaje: "Cada pedido agrupa productos de un solo productor.",
        detalles: [],
      }),
    );

    const error = await api.post("/api/pedidos", {}).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      estado: 422,
      regla: "RN-01",
      message: "Cada pedido agrupa productos de un solo productor.",
    });
  });

  it("al recibir 401 borra la sesión y avisa a la aplicación", async () => {
    guardarToken("vencido", true);
    const aviso = vi.fn();
    eventos.addEventListener(EVENTO_SESION_EXPIRADA, aviso);
    fetchSimulado.mockResolvedValue(
      respuesta(401, { estado: 401, mensaje: "Debes iniciar sesión o tu sesión expiró." }),
    );

    await expect(api.get("/api/pedidos")).rejects.toMatchObject({ estado: 401 });
    expect(leerToken()).toBeNull();
    expect(aviso).toHaveBeenCalledOnce();
  });

  it("explica en lenguaje simple cuando no hay conexión", async () => {
    fetchSimulado.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(api.get("/api/productos")).rejects.toMatchObject({
      estado: 0,
      message: expect.stringContaining("No pudimos conectar"),
    });
  });

  it("acepta respuestas sin cuerpo (204)", async () => {
    fetchSimulado.mockResolvedValue(respuesta(204));
    await expect(api.delete("/api/favoritos/3")).resolves.toBeUndefined();
  });

  it("arma la consulta ignorando filtros vacíos", () => {
    expect(consulta({ q: "café", categoria: "", organico: true, productorId: undefined })).toBe(
      "?q=caf%C3%A9&organico=true",
    );
    expect(consulta({})).toBe("");
  });
});
