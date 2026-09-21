import { readFile, writeFile } from "node:fs/promises";
const output = new URL("../standalone/index.html", import.meta.url);
let html = await readFile(output, "utf8");
const favicon = await readFile(
  new URL("../public/favicon.svg", import.meta.url),
);
html = html.replace(
  /href="\.\/favicon\.svg"/,
  `href="data:image/svg+xml;base64,${favicon.toString("base64")}"`,
);
if (/<script[^>]+src=|<link[^>]+rel="stylesheet"/.test(html))
  throw new Error("Standalone output contains external code or styles.");
await writeFile(output, html);
console.log("Standalone app contains bundled code, styles, fonts and favicon.");
