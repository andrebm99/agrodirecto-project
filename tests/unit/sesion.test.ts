import { describe, expect, it } from "vitest";

import type { Usuario } from "@/types/api";
import { accesoA, agruparClave, erroresPorCampo, panelDe, rolDeApi } from "@/utils/sesion";

function usuario(rol: Usuario["rol"], dobleFactorActivo = false): Usuario {
  return {
    id: 1,
    nombre: "Prueba",
    email: "p@x.pe",
    telefono: null,
    razonSocial: null,
    rol,
    verificado: true,
    estado: "ACTIVO",
    dobleFactorActivo,
  };
}

describe("reglas de sesión en la interfaz", () => {
  it("traduce los roles del backend", () => {
    expect(rolDeApi("AGENTE")).toBe("agente");
    expect(panelDe("administrador")).toBe("admin");
    expect(panelDe("comprador")).toBe("catalogo");
  });

  it("las pantallas públicas no piden sesión", () => {
    expect(accesoA("catalogo", null)).toBe("permitido");
    expect(accesoA("inicio", null)).toBe("permitido");
  });

  it("las pantallas privadas piden sesión y el rol correcto", () => {
    expect(accesoA("pedidos", null)).toBe("requiere-sesion");
    expect(accesoA("pedidos", usuario("COMPRADOR"))).toBe("permitido");
    expect(accesoA("admin", usuario("COMPRADOR"))).toBe("sin-permiso");
    expect(accesoA("seguridad", usuario("PRODUCTOR"))).toBe("permitido");
  });

  it("un agente o administrador sin segundo factor solo puede configurarlo", () => {
    expect(accesoA("productor", usuario("AGENTE", false))).toBe("requiere-doble-factor");
    expect(accesoA("seguridad", usuario("AGENTE", false))).toBe("permitido");
    expect(accesoA("productor", usuario("AGENTE", true))).toBe("permitido");
    expect(accesoA("admin", usuario("ADMINISTRADOR", true))).toBe("permitido");
  });

  it("agrupa los errores de validación del backend por campo", () => {
    expect(
      erroresPorCampo([
        "telefono: debe ser un celular peruano de 9 dígitos",
        "email: must be a well-formed email address",
        "mensaje sin campo",
      ]),
    ).toEqual({
      telefono: "debe ser un celular peruano de 9 dígitos",
      email: "must be a well-formed email address",
    });
  });

  it("agrupa la clave del segundo factor de 4 en 4", () => {
    expect(agruparClave("ABCDEFGHIJ")).toBe("ABCD EFGH IJ");
  });
});
