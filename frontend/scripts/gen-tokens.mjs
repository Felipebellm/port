// Generates src/portfolio/tokens.css from ../DESIGN.md (the design-system source of truth).
// Colors / spacing / rounded come from the official `design.md export --format css-vars`;
// typography (not covered by css-vars) is emitted as `.t-<token>` classes from the parsed tokens.
// Don't edit tokens.css by hand — edit DESIGN.md and run `npm run tokens`.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { lint } from "@google/design.md/linter";

const here = dirname(fileURLToPath(import.meta.url));
const designPath = resolve(here, "../../DESIGN.md");
const outPath = resolve(here, "../src/portfolio/tokens.css");
const cli = resolve(here, "../node_modules/@google/design.md/dist/index.js");

const report = lint(readFileSync(designPath, "utf8"));
if (report.summary.errors > 0) {
  console.error(JSON.stringify(report.findings.filter((f) => f.severity === "error"), null, 2));
  process.exit(1);
}

const vars = execFileSync(process.execPath, [cli, "export", "--format", "css-vars", designPath], { encoding: "utf8" });

// Theme convention: a color token named `<base>-light` overrides `--color-<base>` when <html data-theme="light">.
const lightDecls = vars.split("\n")
  .map((line) => line.match(/^\s*--color-(.+)-light:\s*(.+);/))
  .filter(Boolean)
  .map(([, base, value]) => `  --color-${base}: ${value};`);
const themes = `:root{color-scheme:dark;}\n:root[data-theme="light"] {\n  color-scheme: light;\n${lightDecls.join("\n")}\n}`;

// Font stacks, also exposed as `--font-<role>` for the few places that mix faces by hand (ransom letters).
const FONTS = {
  Anton: { role: "display", stack: "'Anton','Arial Narrow',Impact,sans-serif" },
  "Courier Prime": { role: "mono", stack: "'Courier Prime','Courier New',ui-monospace,monospace" },
  Manrope: { role: "body", stack: "'Manrope',system-ui,sans-serif" },
};
const fontVars = `:root {\n${Object.values(FONTS).map((f) => `  --font-${f.role}: ${f.stack};`).join("\n")}\n}`;

// DESIGN.md needs dimensions, CSS wants better units: px font sizes become rem (so the reader's browser
// font size applies) and `em` line-heights become unitless (so they scale with a fluid font size).
const dim = (d) => `${d.value}${d.unit}`;
const rem = (d) => (d.unit === "px" ? `${+(d.value / 16).toFixed(4)}rem` : dim(d));
const unitless = (d) => (d.unit === "em" ? `${d.value}` : dim(d));
const typeClasses = [...report.designSystem.typography.entries()].map(([name, t]) => {
  const decls = [`font-family:${FONTS[t.fontFamily]?.stack ?? `'${t.fontFamily}'`}`];
  if (t.fontSize) decls.push(`font-size:${rem(t.fontSize)}`);
  if (t.fontWeight) decls.push(`font-weight:${t.fontWeight}`);
  if (t.lineHeight) decls.push(`line-height:${unitless(t.lineHeight)}`);
  if (t.letterSpacing) decls.push(`letter-spacing:${dim(t.letterSpacing)}`);
  return `.t-${name}{${decls.join(";")};}`;
});

writeFileSync(outPath, `/* GENERATED from DESIGN.md by scripts/gen-tokens.mjs — do not edit. */\n${vars.trim()}\n\n${themes}\n\n${fontVars}\n\n${typeClasses.join("\n")}\n`);
console.log(`tokens.css written (${report.summary.warnings} lint warnings)`);
