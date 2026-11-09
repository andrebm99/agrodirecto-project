import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the AgroDirecto prototype", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /AgroDirecto/i);
  assert.match(html, /Del campo a tu negocio/i);
  assert.match(html, /Sin cobros en línea/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps starter preview artifacts removed", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /AgroDirectoApp/);
  assert.match(layout, /AgroDirecto/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("src/app/_sites-preview/", projectRoot)));
});

test("includes the complete Avance 1 interactive scope", async () => {
  const [source, styles] = await Promise.all([
    Promise.all(
      [
        "components/AgroDirectoApp.tsx",
        "screens/ProductForm.tsx",
        "screens/Home.tsx",
        "services/storage.ts",
      ].map((file) => readFile(new URL(`../src/${file}`, import.meta.url), "utf8")),
    ).then((files) => files.join("\n")),
    readFile(new URL("../src/styles/globals.css", import.meta.url), "utf8"),
  ]);

  const requiredViews = [
    "inicio",
    "login",
    "registro",
    "catalogo",
    "producto",
    "carrito",
    "confirmar",
    "pedidos",
    "productor",
    "publicar",
    "recibidos",
    "admin",
  ];
  for (const view of requiredViews) assert.match(source, new RegExp(`${view}:`));

  assert.match(source, /Guardar borrador/);
  assert.match(source, /agrodirecto-products-v2/);
  assert.match(source, /mobile-bottom-nav/);
  assert.match(source, /Fundamento del proyecto/);
  assert.match(styles, /@media \(max-width: 700px\)/);
  assert.match(styles, /\.mobile-bottom-nav/);
});
