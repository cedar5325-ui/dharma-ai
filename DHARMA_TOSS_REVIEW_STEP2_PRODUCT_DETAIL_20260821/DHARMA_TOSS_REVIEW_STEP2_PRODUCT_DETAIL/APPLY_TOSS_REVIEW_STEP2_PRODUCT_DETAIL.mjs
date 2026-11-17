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
  throw new Error("package.json이 있는 DHARMA 프로젝트 폴더를 찾지 못했습니다.");
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

  const detailPage = path.join(root, "src", "app", "materials", "[id]", "page.tsx");
  const componentDir = path.join(root, "src", "components");
  const componentPath = path.join(componentDir, "TossReviewProductPolicy.tsx");

  console.log("");
  console.log("DHARMA Toss Review Step 2 - Product detail policy");
  console.log(`Project: ${root}`);
  console.log("");

  if (!fs.existsSync(detailPage)) {
    throw new Error(`상품 상세페이지를 찾지 못했습니다: ${detailPage}`);
  }

  fs.mkdirSync(componentDir, { recursive: true });

  const componentSource = fs.readFileSync(path.join(SCRIPT_DIR, "TossReviewProductPolicy.tsx"), "utf8");
  fs.writeFileSync(componentPath, componentSource, "utf8");
  console.log(`Installed: ${componentPath}`);

  let src = fs.readFileSync(detailPage, "utf8");

  if (src.includes(MARKER)) {
    console.log("Step 2 marker already exists. Page patch skipped.");
  } else {
    backup(detailPage);

    const importLine = 'import TossReviewProductPolicy from "@/components/TossReviewProductPolicy";';

    if (!src.includes(importLine)) {
      const importMatches = [...src.matchAll(/^import .*$/gm)];
      if (importMatches.length > 0) {
        const last = importMatches[importMatches.length - 1];
        const end = last.index + last[0].length;
        src = src.slice(0, end) + "\\n" + importLine + src.slice(end);
      } else {
        src = importLine + "\\n" + src;
      }
    }

    const insert = `\\n      {/* ${MARKER} */}\\n      <TossReviewProductPolicy />\\n`;
    const mainClose = src.lastIndexOf("</main>");

    if (mainClose >= 0) {
      src = src.slice(0, mainClose) + insert + src.slice(mainClose);
    } else {
      throw new Error("상세페이지에서 </main>을 찾지 못했습니다. 안전을 위해 자동 수정을 중단합니다.");
    }

    if (!src.includes(MARKER) || !src.includes("<TossReviewProductPolicy")) {
      throw new Error("상품 상세페이지 패치 검증 실패");
    }

    fs.writeFileSync(detailPage, src, "utf8");
    console.log(`Patched: ${detailPage}`);
  }

  const nextDir = path.join(root, ".next");
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log("Removed .next cache.");
  }

  console.log("");
  console.log("Step 2 patch completed.");
  console.log("- 기존 가격/결제 로직은 수정하지 않았습니다.");
  console.log("- 결제방식/제공시점/30일 이용기간/환불정책 링크만 추가했습니다.");
  console.log("Next: npm.cmd run build");
}

try { main(); }
catch (e) {
  console.error("");
  console.error(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
}
