import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const MARKER = "DHARMA_TOSS_REVIEW_STEP2_PRODUCT_DETAIL";

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--project" && argv[i + 1]) out.project = argv[++i];
  }
  return out;
}

function findRoot(candidate) {
  for (const start of [candidate, process.cwd(), SCRIPT_DIR].filter(Boolean)) {
    let p = path.resolve(start);
    for (let i = 0; i < 10; i++) {
      if (fs.existsSync(path.join(p, "package.json"))) return p;
      const parent = path.dirname(p);
      if (parent === p) break;
      p = parent;
    }
  }
  throw new Error("DHARMA project root not found.");
}

function stamp() {
  const d = new Date();
  const z = v => String(v).padStart(2, "0");
  return `${d.getFullYear()}${z(d.getMonth()+1)}${z(d.getDate())}_${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`;
}

function backup(file) {
  const dest = `${file}.backup_${stamp()}`;
  fs.copyFileSync(file, dest);
  console.log(`Backup: ${dest}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = findRoot(args.project);
  const page = path.join(root, "src", "app", "materials", "[id]", "page.tsx");
  const componentDir = path.join(root, "src", "components");
  const componentPath = path.join(componentDir, "TossReviewProductPolicy.tsx");

  if (!fs.existsSync(page)) {
    throw new Error(`Missing product detail page: ${page}`);
  }

  fs.mkdirSync(componentDir, { recursive: true });
  fs.copyFileSync(path.join(SCRIPT_DIR, "TossReviewProductPolicy.tsx"), componentPath);
  console.log(`Installed: ${componentPath}`);

  let src = fs.readFileSync(page, "utf8");

  if (!src.includes(MARKER)) {
    backup(page);

    const importLine = 'import TossReviewProductPolicy from "@/components/TossReviewProductPolicy";';
    if (!src.includes(importLine)) {
      const lines = src.split(/\r?\n/);
      let lastImport = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith("import ")) lastImport = i;
      }
      if (lastImport >= 0) {
        lines.splice(lastImport + 1, 0, importLine);
        src = lines.join("\n");
      } else {
        src = importLine + "\n" + src;
      }
    }

    const insert =
      `\n      {/* ${MARKER} */}\n` +
      `      <TossReviewProductPolicy />\n`;

    const idx = src.lastIndexOf("</main>");
    if (idx < 0) {
      throw new Error("Could not find </main>; no page changes written.");
    }

    src = src.slice(0, idx) + insert + src.slice(idx);
    fs.writeFileSync(page, src, "utf8");
    console.log(`Patched: ${page}`);
  } else {
    console.log("Step 2 marker already present; page patch skipped.");
  }

  const nextDir = path.join(root, ".next");
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log("Removed .next cache.");
  }

  console.log("Step 2 V2 completed.");
  console.log("Next: npm.cmd run build");
}

try { main(); }
catch (e) {
  console.error(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
}
