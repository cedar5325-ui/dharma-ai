import fs from "node:fs";
import path from "node:path";

const i = process.argv.indexOf("--project");
const root = path.resolve(i >= 0 ? process.argv[i+1] : process.cwd());

const page = path.join(root, "src", "app", "materials", "[id]", "page.tsx");
const component = path.join(root, "src", "components", "TossReviewProductPolicy.tsx");

const pageSrc = fs.existsSync(page) ? fs.readFileSync(page, "utf8") : "";
const compSrc = fs.existsSync(component) ? fs.readFileSync(component, "utf8") : "";

const checks = [
  ["detail page exists", fs.existsSync(page)],
  ["policy component exists", fs.existsSync(component)],
  ["page marker", pageSrc.includes("DHARMA_TOSS_REVIEW_STEP2_PRODUCT_DETAIL")],
  ["component rendered", pageSrc.includes("<TossReviewProductPolicy")],
  ["one-time payment text", compSrc.includes("건별 일회성 결제")],
  ["30-day service period", compSrc.includes("결제일로부터 30일")],
  ["refund link", compSrc.includes('href="/refund"')],
  ["20,000 / 50,000 price text", compSrc.includes("20,000원") && compSrc.includes("50,000원")],
];

let ok = true;
for (const [name, pass] of checks) {
  console.log(`${pass ? "OK" : "FAIL"} - ${name}`);
  if (!pass) ok = false;
}
if (!ok) process.exit(1);
console.log("");
console.log("Step 2 static verification passed.");
