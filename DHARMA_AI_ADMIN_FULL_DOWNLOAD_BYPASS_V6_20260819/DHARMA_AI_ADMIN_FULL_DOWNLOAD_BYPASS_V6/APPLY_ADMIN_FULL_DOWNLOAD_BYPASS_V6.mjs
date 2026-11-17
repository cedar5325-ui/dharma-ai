import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const V3 = "DHARMA_PG_PAYMENT_DOWNLOAD_POLICY";
const V5 = "DHARMA_ADMIN_COOKIE_DOWNLOAD_BYPASS_V5";
const V6 = "DHARMA_ADMIN_FULL_DOWNLOAD_BYPASS_V6";

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--project" && argv[i+1]) {
      out.project = argv[++i];
    }
  }
  return out;
}

function rootFrom(candidate) {
  const starts = [candidate, process.cwd(), SCRIPT_DIR].filter(Boolean);
  for (const s of starts) {
    let p = path.resolve(s);
    for (let i=0; i<10; i++) {
      if (fs.existsSync(path.join(p, "package.json"))) return p;
      const up = path.dirname(p);
      if (up === p) break;
      p = up;
    }
  }
  throw new Error("DHARMA project root containing package.json was not found.");
}

function stamp() {
  const d = new Date();
  const z = v => String(v).padStart(2,"0");
  return `${d.getFullYear()}${z(d.getMonth()+1)}${z(d.getDate())}_${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`;
}

function backup(file) {
  const dest = `${file}.backup_${stamp()}`;
  fs.copyFileSync(file, dest);
  console.log(`Backup: ${dest}`);
}

function replaceOnce(src, regex, replacement, label) {
  if (!regex.test(src)) throw new Error(`Could not locate: ${label}`);
  regex.lastIndex = 0;
  return src.replace(regex, replacement);
}

function patch(route) {
  let src = fs.readFileSync(route, "utf8");

  if (!src.includes(V3) || !src.includes("enforcePgApprovalBeforeDownload")) {
    throw new Error("Existing V3 PG/payment policy was not found. No changes made.");
  }
  if (!src.includes(V5) || !src.includes('dharma_admin_session')) {
    throw new Error("Existing V5 admin cookie check was not found. No changes made.");
  }
  if (src.includes(V6)) {
    console.log("V6 is already installed.");
    return;
  }

  // 1) Token requirement: ordinary users only.
  src = replaceOnce(
    src,
    /(\s*)if\s*\(\s*!token\s*\)\s*\{/,
    `$1// ${V6}\n$1if (!dharmaAdminDownloadAllowed && !token) {`,
    "token guard"
  );

  // 2) Purchase lookup + paid requirement: ordinary users only.
  const purchaseBlock =
    /(\s*)const\s+purchase\s*=\s*await\s+fetchPaidPurchase\(url,\s*key,\s*material\.id,\s*token\);\s*\r?\n\s*if\s*\(\s*!purchase\s*\)\s*\{([\s\S]*?)\r?\n\s*\}\s*(?=\r?\n\s*const\s+bucket\s*=)/m;

  const match = purchaseBlock.exec(src);
  if (!match) throw new Error("Could not locate paid-purchase verification block.");

  const indent = match[1] || "    ";
  const oldIfBody = match[2];

  const purchaseReplacement =
`${indent}let purchase: any = null;

${indent}if (!dharmaAdminDownloadAllowed) {
${indent}  purchase = await fetchPaidPurchase(url, key, material.id, token);

${indent}  if (!purchase) {${oldIfBody}
${indent}  }
${indent}}`;

  src = src.replace(purchaseBlock, purchaseReplacement);

  // 3) Download history marking: only when there is an actual purchase.
  src = replaceOnce(
    src,
    /(\s*)await\s+markDownloaded\(url,\s*key,\s*purchase\);/,
    `$1if (purchase) {\n$1  await markDownloaded(url, key, purchase);\n$1}`,
    "markDownloaded call"
  );

  // Safety assertions.
  const required = [
    V6,
    V5,
    V3,
    'request.cookies.get("dharma_admin_session")?.value === "authorized"',
    "enforcePgApprovalBeforeDownload",
    "if (!dharmaAdminDownloadAllowed && !token)",
    "if (!dharmaAdminDownloadAllowed) {",
    "purchase = await fetchPaidPurchase",
    "if (purchase) {",
    "await markDownloaded(url, key, purchase)",
    "return NextResponse.redirect(signedUrl)"
  ];
  for (const item of required) {
    if (!src.includes(item)) {
      throw new Error(`Safety check failed; missing: ${item}`);
    }
  }

  backup(route);
  fs.writeFileSync(route, src, "utf8");
  console.log(`Patched: ${route}`);
}

function main() {
  const a = args(process.argv.slice(2));
  const root = rootFrom(a.project);
  const route = path.join(root, "src", "app", "api", "materials", "[id]", "download", "route.ts");

  console.log("");
  console.log("DHARMA AI V6 - Full admin download bypass, customer payment policy preserved");
  console.log(`Project: ${root}`);
  console.log("");

  if (!fs.existsSync(route)) throw new Error(`Missing download route: ${route}`);
  patch(route);

  const nextDir = path.join(root, ".next");
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, {recursive:true, force:true});
    console.log("Removed .next cache.");
  }

  console.log("");
  console.log("V6 patch completed.");
  console.log("- Authenticated admin: no purchase token/payment record required.");
  console.log("- Non-admin: V3 PG/payment policy unchanged.");
  console.log("- Paid customer downloads still update download_count.");
  console.log("- Admin downloads do not create or modify purchase records.");
}

try { main(); }
catch (e) {
  console.error("");
  console.error(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
}
