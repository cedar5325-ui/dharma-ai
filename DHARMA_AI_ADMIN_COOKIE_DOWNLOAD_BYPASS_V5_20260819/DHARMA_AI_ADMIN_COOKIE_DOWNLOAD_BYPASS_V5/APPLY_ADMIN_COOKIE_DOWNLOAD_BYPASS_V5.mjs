import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const V3_MARKER = "DHARMA_PG_PAYMENT_DOWNLOAD_POLICY";
const V4_MARKER = "DHARMA_ADMIN_LOGIN_DOWNLOAD_BYPASS_V4";
const V5_MARKER = "DHARMA_ADMIN_COOKIE_DOWNLOAD_BYPASS_V5";

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--project" && argv[i + 1]) {
      out.project = argv[i + 1];
      i += 1;
    }
  }
  return out;
}

function locateProjectRoot(candidate) {
  const starts = [candidate, process.cwd(), SCRIPT_DIR].filter(Boolean);
  for (const start of starts) {
    let current = path.resolve(start);
    for (let depth = 0; depth < 10; depth += 1) {
      if (fs.existsSync(path.join(current, "package.json"))) return current;
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  throw new Error("Could not locate the DHARMA project folder containing package.json.");
}

function stamp() {
  const d = new Date();
  const p = (v) => String(v).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function backup(filePath) {
  const backupPath = `${filePath}.backup_${stamp()}`;
  fs.copyFileSync(filePath, backupPath);
  console.log(`Backup: ${backupPath}`);
}

function removeOldV4Helper(src) {
  // Remove the V4 fetch-based helper if present.
  return src.replace(
    /\nasync function hasDharmaAdminDownloadAccess\(request\) \{[\s\S]*?\n\}\n(?=\r?\n|export|const|function)/m,
    "\n"
  );
}

function patchRoute(routePath) {
  let src = fs.readFileSync(routePath, "utf8");

  if (!src.includes(V3_MARKER) || !src.includes("enforcePgApprovalBeforeDownload")) {
    throw new Error("V3 PG/payment policy not found. No changes were made.");
  }

  if (src.includes(V5_MARKER)) {
    console.log("V5 admin-cookie bypass is already installed.");
    return;
  }

  src = removeOldV4Helper(src);

  // Replace V4 wrapper if present.
  const v4Regex =
    /(\s*)\/\/\s*DHARMA_ADMIN_LOGIN_DOWNLOAD_BYPASS_V4\r?\n\s*const\s+dharmaAdminDownloadAllowed\s*=\s*await\s+hasDharmaAdminDownloadAccess\(([^)]+)\);\r?\n\s*if\s*\(\s*!dharmaAdminDownloadAllowed\s*\)\s*\{\r?\n\s*\/\/\s*DHARMA_PG_PAYMENT_DOWNLOAD_POLICY\r?\n\s*const\s+dharmaPgPolicyBlock\s*=\s*enforcePgApprovalBeforeDownload\(([^)]+)\);\r?\n\s*if\s*\(\s*dharmaPgPolicyBlock\s*\)\s*return\s+dharmaPgPolicyBlock;\r?\n\s*\}/m;

  const v4 = v4Regex.exec(src);

  if (v4) {
    const indent = v4[1] || "  ";
    const req = v4[2].trim();
    const replacement =
`${indent}// ${V5_MARKER}
${indent}const dharmaAdminDownloadAllowed =
${indent}  ${req}.cookies.get("dharma_admin_session")?.value === "authorized";

${indent}if (!dharmaAdminDownloadAllowed) {
${indent}  // ${V3_MARKER}
${indent}  const dharmaPgPolicyBlock = enforcePgApprovalBeforeDownload(${req});
${indent}  if (dharmaPgPolicyBlock) return dharmaPgPolicyBlock;
${indent}}`;
    src = src.replace(v4Regex, replacement);
  } else {
    // If V4 was not present, patch the original V3 guard.
    const v3Regex =
      /(\s*)\/\/\s*DHARMA_PG_PAYMENT_DOWNLOAD_POLICY[^\r\n]*\r?\n\s*const\s+dharmaPgPolicyBlock\s*=\s*enforcePgApprovalBeforeDownload\(([^)]+)\);\r?\n\s*if\s*\(\s*dharmaPgPolicyBlock\s*\)\s*return\s+dharmaPgPolicyBlock;?/m;

    const v3 = v3Regex.exec(src);
    if (!v3) {
      throw new Error("Could not locate the exact V3 PG guard block. No changes were made.");
    }

    const indent = v3[1] || "  ";
    const req = v3[2].trim();
    const replacement =
`${indent}// ${V5_MARKER}
${indent}const dharmaAdminDownloadAllowed =
${indent}  ${req}.cookies.get("dharma_admin_session")?.value === "authorized";

${indent}if (!dharmaAdminDownloadAllowed) {
${indent}  // ${V3_MARKER}
${indent}  const dharmaPgPolicyBlock = enforcePgApprovalBeforeDownload(${req});
${indent}  if (dharmaPgPolicyBlock) return dharmaPgPolicyBlock;
${indent}}`;
    src = src.replace(v3Regex, replacement);
  }

  if (!src.includes(V5_MARKER)) throw new Error("V5 marker insertion failed.");
  if (!src.includes(V3_MARKER)) throw new Error("V3 marker disappeared; refusing to write.");
  if (!src.includes("enforcePgApprovalBeforeDownload")) throw new Error("PG gate disappeared; refusing to write.");
  if (!src.includes('cookies.get("dharma_admin_session")?.value === "authorized"')) {
    throw new Error("Direct admin cookie check was not inserted.");
  }

  backup(routePath);
  fs.writeFileSync(routePath, src.replace(/\r?\n/g, "\r\n"), "utf8");
  console.log(`Patched: ${routePath}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = locateProjectRoot(args.project);
  const route = path.join(root, "src", "app", "api", "materials", "[id]", "download", "route.ts");

  console.log("");
  console.log("DHARMA AI V5 - Direct admin cookie download bypass");
  console.log(`Project: ${root}`);
  console.log("");

  if (!fs.existsSync(route)) throw new Error(`Download route not found: ${route}`);

  patchRoute(route);

  const nextDir = path.join(root, ".next");
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log("Removed .next cache.");
  }

  console.log("");
  console.log("Patch completed.");
  console.log('- Admin cookie "dharma_admin_session=authorized": download allowed.');
  console.log("- Non-admin: existing V3 PG/payment policy remains unchanged.");
}

try {
  main();
} catch (error) {
  console.error("");
  console.error(error instanceof Error ? `ERROR: ${error.message}` : String(error));
  process.exitCode = 1;
}
