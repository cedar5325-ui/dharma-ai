import fs from "node:fs";
import path from "node:path";

const argIndex = process.argv.indexOf("--project");
const root = path.resolve(argIndex >= 0 ? process.argv[argIndex + 1] : process.cwd());
const route = path.join(root, "src", "app", "api", "materials", "[id]", "download", "route.ts");
if (!fs.existsSync(route)) {
  console.error(`Missing: ${route}`);
  process.exit(1);
}
const src = fs.readFileSync(route, "utf8");

const checks = [
  ["V5 marker", src.includes("DHARMA_ADMIN_COOKIE_DOWNLOAD_BYPASS_V5")],
  ["Direct admin cookie check", src.includes('cookies.get("dharma_admin_session")?.value === "authorized"')],
  ["V3 marker retained", src.includes("DHARMA_PG_PAYMENT_DOWNLOAD_POLICY")],
  ["PG gate retained", src.includes("enforcePgApprovalBeforeDownload")],
  ["Old V4 helper removed", !src.includes("hasDharmaAdminDownloadAccess")],
];

let ok = true;
for (const [name, passed] of checks) {
  console.log(`${passed ? "OK" : "FAIL"} - ${name}`);
  if (!passed) ok = false;
}
if (!ok) process.exit(1);
console.log("");
console.log("Verification passed.");
