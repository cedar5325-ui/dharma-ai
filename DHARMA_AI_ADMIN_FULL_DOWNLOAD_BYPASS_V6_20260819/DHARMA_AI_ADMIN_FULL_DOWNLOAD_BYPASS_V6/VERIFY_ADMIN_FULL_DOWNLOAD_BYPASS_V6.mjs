import fs from "node:fs";
import path from "node:path";

const i = process.argv.indexOf("--project");
const root = path.resolve(i >= 0 ? process.argv[i+1] : process.cwd());
const route = path.join(root,"src","app","api","materials","[id]","download","route.ts");

if (!fs.existsSync(route)) {
  console.error("Download route missing.");
  process.exit(1);
}
const s = fs.readFileSync(route,"utf8");

const tests = [
  ["V6 marker", s.includes("DHARMA_ADMIN_FULL_DOWNLOAD_BYPASS_V6")],
  ["Admin cookie retained", s.includes('request.cookies.get("dharma_admin_session")?.value === "authorized"')],
  ["V3 policy retained", s.includes("DHARMA_PG_PAYMENT_DOWNLOAD_POLICY") && s.includes("enforcePgApprovalBeforeDownload")],
  ["Token required only for non-admin", s.includes("if (!dharmaAdminDownloadAllowed && !token)")],
  ["Purchase check inside non-admin path", /if\s*\(\s*!dharmaAdminDownloadAllowed\s*\)\s*\{[\s\S]*purchase\s*=\s*await\s+fetchPaidPurchase/.test(s)],
  ["Purchase mark guarded", /if\s*\(\s*purchase\s*\)\s*\{[\s\S]*markDownloaded/.test(s)],
  ["Signed URL redirect retained", s.includes("return NextResponse.redirect(signedUrl)")],
];

let ok = true;
for (const [name, pass] of tests) {
  console.log(`${pass ? "OK" : "FAIL"} - ${name}`);
  if (!pass) ok = false;
}
if (!ok) process.exit(1);
console.log("");
console.log("V6 verification passed.");
