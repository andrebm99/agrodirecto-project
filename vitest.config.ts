import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Configuración separada de vite.config.ts: las pruebas unitarias no necesitan el servidor de Vinext.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["tests/unit/**/*.test.ts"], environment: "node" },
});
