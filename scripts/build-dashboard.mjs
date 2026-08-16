// Build del dashboard de tareas Fing para GitHub Pages.
// Lee los README-TASK.md / README-HISTORYTASK.md de los repos clonados,
// bakea los datos dentro de dashboard/template.html y escribe dist/index.html.
//
// Uso: node scripts/build-dashboard.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Orígenes: carpeta donde el workflow clonó cada repo -> etiqueta de origen.
const SOURCES = [
  { source: "backend",  base: resolve(ROOT, "sources/fing") },
  { source: "frontend", base: resolve(ROOT, "sources/fing-front") },
];

const TEMPLATE = resolve(ROOT, "dashboard/template.html");
const OUT_DIR  = resolve(ROOT, "dist");
const OUT_FILE = resolve(OUT_DIR, "index.html");

// ---- Parsers (misma lógica que corre en el navegador) ----
const clean = (s) => s
  .replace(/`([^`]+)`/g, "$1")
  .replace(/\*\*([^*]+)\*\*/g, "$1")
  .replace(/\((\d{1,3})%\)/g, "")
  .replace(/\(Fecha:[^)]*\)/gi, "")
  .trim();

function parsePending(md, source) {
  const out = [];
  let group = "";
  md.split(/\r?\n/).forEach((line) => {
    const h = line.match(/^#{2,4}\s+(.*)$/);
    if (h) { group = clean(h[1]).replace(/^[^\wÁ-ú]+/, "").trim(); return; }
    const m = line.match(/^\s*-\s*\[\s*\]\s+(.*)$/); // - [ ] o - []
    if (!m) return;
    const raw = m[1];
    const pct = raw.match(/\((\d{1,3})%\)/);
    out.push({ source, group: group || "General", text: clean(raw), pct: pct ? Math.min(100, +pct[1]) : 0 });
  });
  return out;
}

function parseDone(md, source) {
  const out = [];
  md.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*-\s*\[x\]\s+(.*)$/i);
    if (!m) return;
    const raw = m[1];
    const d = raw.match(/Fecha:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
    out.push({ source, text: clean(raw), date: d ? d[1] : null });
  });
  return out;
}

const readSafe = (p) => existsSync(p) ? readFileSync(p, "utf8") : "";

// ---- Recolectar ----
const pending = [];
const done = [];
for (const { source, base } of SOURCES) {
  const t = readSafe(resolve(base, "README-TASK.md"));
  const h = readSafe(resolve(base, "README-HISTORYTASK.md"));
  if (!t && !h) console.warn(`[aviso] Sin archivos de tareas para "${source}" en ${base}`);
  pending.push(...parsePending(t, source));
  done.push(...parseDone(h, source));
}

const data = {
  pending,
  done,
  generatedAt: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
};

// ---- Inyectar en el template ----
let html = readFileSync(TEMPLATE, "utf8");
const inject = `<script>window.__FING_DATA__ = ${JSON.stringify(data)};</script>`;
if (html.includes("</head>")) {
  html = html.replace("</head>", `  ${inject}\n</head>`);
} else {
  html = inject + "\n" + html;
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, html, "utf8");

console.log(`OK -> ${OUT_FILE}`);
console.log(`Pendientes: ${pending.length} | Completadas: ${done.length} | ${data.generatedAt}`);
