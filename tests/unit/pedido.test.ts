import { describe, expect, it } from "vitest";

import { EN_CURSO, ESTADO_PEDIDO, sugerencia } from "@/utils/pedido";

describe("textos del pedido", () => {
  it("todos los estados tienen nombre en español", () => {
    expect(Object.keys(ESTADO_PEDIDO)).toHaveLength(11);
    expect(EN_CURSO).not.toContain("COMPLETADO");
  });
  it("sugiere qué hacer ante una regla de negocio", () => {
    expect(sugerencia("RN-10")).toMatch(/recojo en chacra/);
    expect(sugerencia("RN-99")).toBeNull();
  });
});
