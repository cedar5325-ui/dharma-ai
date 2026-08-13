import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type JsonRecord = Record<string, unknown>;

type LatestUploadResult = {
  value: string;
  source: string;
};

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

function normalizeTimestamp(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function getSupabaseCredentials() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return {
    url: url.replace(/\/$/, ""),
    key,
  };
}

async function fetchJson(url: URL, key: string): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

async function readSystemStatus(
  supabaseUrl: string,
  key: string,
): Promise<LatestUploadResult | null> {
  const url = new URL(`${supabaseUrl}/rest/v1/dharma_system_status`);
  url.searchParams.set("select", "event_at");
  url.searchParams.set("status_key", "eq.last_material_upload");
  url.searchParams.set("limit", "1");

  const payload = await fetchJson(url, key);
  if (!Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  const row = payload[0] as JsonRecord;
  const value = normalizeTimestamp(row.event_at);
  return value ? { value, source: "status:last_material_upload" } : null;
}

async function readLatestMaterialColumn(
  supabaseUrl: string,
  key: string,
  column: string,
): Promise<LatestUploadResult | null> {
  const url = new URL(`${supabaseUrl}/rest/v1/dharma_materials`);
  url.searchParams.set("select", column);
  url.searchParams.set(column, "not.is.null");
  url.searchParams.set("order", `${column}.desc`);
  url.searchParams.set("limit", "1");

  const payload = await fetchJson(url, key);
  if (!Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  const row = payload[0] as JsonRecord;
  const value = normalizeTimestamp(row[column]);
  return value ? { value, source: `material:${column}` } : null;
}

function extractLatestFromMaterialsPayload(payload: unknown): string | null {
  const record =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as JsonRecord)
      : null;
  const candidates = record
    ? record.materials ?? record.data ?? record.items
    : payload;

  if (!Array.isArray(candidates)) {
    return null;
  }

  const preferredFields = [
    "uploaded_at",
    "uploadedAt",
    "created_at",
    "createdAt",
    "updated_at",
    "updatedAt",
    "modified_at",
    "modifiedAt",
  ];

  let latest: string | null = null;
  let latestTime = -1;

  for (const item of candidates) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }

    const material = item as JsonRecord;
    let itemTimestamp: string | null = null;

    for (const field of preferredFields) {
      itemTimestamp = normalizeTimestamp(material[field]);
      if (itemTimestamp) {
        break;
      }
    }

    if (!itemTimestamp) {
      continue;
    }

    const time = new Date(itemTimestamp).getTime();
    if (time > latestTime) {
      latest = itemTimestamp;
      latestTime = time;
    }
  }

  return latest;
}

async function readPublicMaterialsApi(
  request: NextRequest,
): Promise<LatestUploadResult | null> {
  try {
    const url = new URL("/api/materials", request.url);
    url.searchParams.set("_upload_clock", Date.now().toString());

    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;
    const value = extractLatestFromMaterialsPayload(payload);
    return value ? { value, source: "materials-api" } : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const credentials = getSupabaseCredentials();
  let result: LatestUploadResult | null = null;

  if (credentials.url && credentials.key) {
    result = await readSystemStatus(credentials.url, credentials.key);

    if (!result) {
      for (const column of ["uploaded_at", "created_at", "updated_at"]) {
        result = await readLatestMaterialColumn(
          credentials.url,
          credentials.key,
          column,
        );
        if (result) {
          break;
        }
      }
    }
  }

  if (!result) {
    result = await readPublicMaterialsApi(request);
  }

  const environmentFallback = normalizeTimestamp(
    process.env.NEXT_PUBLIC_DHARMA_LAST_UPGRADE_AT,
  );
  const lastUploadAt = result?.value || environmentFallback;

  return NextResponse.json(
    {
      ok: Boolean(result),
      lastUploadAt,
      source: result?.source ||
        (environmentFallback ? "environment-fallback" : "unavailable"),
      checkedAt: new Date().toISOString(),
    },
    { headers: NO_STORE_HEADERS },
  );
}
