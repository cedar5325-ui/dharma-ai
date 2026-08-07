import { promises as fs } from "fs";
import path from "path";
import type { PublicKnowledgeBaseItem } from "@/lib/kb-classifier";
import { summarizeKnowledgeBase } from "@/lib/kb-classifier";

export type DriveFingerprint = {
  id: string;
  modifiedTime?: string | null;
};

export type KnowledgeBaseCache = {
  version: number;
  syncedAt: string;
  driveFileCount: number;
  excludedFileCount: number;
  summary: ReturnType<typeof summarizeKnowledgeBase>;
  items: PublicKnowledgeBaseItem[];
  fingerprints: DriveFingerprint[];
  exposurePolicy: {
    fileNames: "hidden";
    fileContents: "hidden";
    driveLinks: "hidden";
    rule: string;
  };
};

const cacheDir = path.join(process.cwd(), ".dharma");
const cachePath = path.join(cacheDir, "knowledge-base.json");

export async function readKnowledgeBaseCache(): Promise<KnowledgeBaseCache | null> {
  try {
    const raw = await fs.readFile(cachePath, "utf-8");
    return JSON.parse(raw) as KnowledgeBaseCache;
  } catch {
    return null;
  }
}

export async function writeKnowledgeBaseCache(
  items: PublicKnowledgeBaseItem[],
  fingerprints: DriveFingerprint[],
  options?: {
    driveFileCount?: number;
    excludedFileCount?: number;
  }
) {
  await fs.mkdir(cacheDir, { recursive: true });

  const cache: KnowledgeBaseCache = {
    version: 2,
    syncedAt: new Date().toISOString(),
    driveFileCount: options?.driveFileCount ?? fingerprints.length,
    excludedFileCount: options?.excludedFileCount ?? 0,
    summary: summarizeKnowledgeBase(items),
    items,
    fingerprints,
    exposurePolicy: {
      fileNames: "hidden",
      fileContents: "hidden",
      driveLinks: "hidden",
      rule: "고객 화면과 API 응답에는 원본 파일명, 원문 내용, Drive 링크를 노출하지 않습니다.",
    },
  };

  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2), "utf-8");
  return cache;
}

export function createFingerprints(files: Array<{ id: string; modifiedTime?: string | null }>): DriveFingerprint[] {
  return files.map((file) => ({
    id: file.id,
    modifiedTime: file.modifiedTime || null,
  }));
}

export function compareFingerprints(current: DriveFingerprint[], cached: DriveFingerprint[]) {
  const cachedMap = new Map(cached.map((item) => [item.id, item.modifiedTime || ""]));
  const currentMap = new Map(current.map((item) => [item.id, item.modifiedTime || ""]));

  const newFiles = current.filter((item) => !cachedMap.has(item.id));
  const updatedFiles = current.filter((item) => {
    if (!cachedMap.has(item.id)) return false;
    return (cachedMap.get(item.id) || "") !== (item.modifiedTime || "");
  });
  const deletedFiles = cached.filter((item) => !currentMap.has(item.id));

  return {
    hasUpdates: newFiles.length > 0 || updatedFiles.length > 0 || deletedFiles.length > 0,
    newCount: newFiles.length,
    updatedCount: updatedFiles.length,
    deletedCount: deletedFiles.length,
  };
}

export async function clearKnowledgeBaseCache() {
  try {
    await fs.unlink(cachePath);
    return true;
  } catch {
    return false;
  }
}
