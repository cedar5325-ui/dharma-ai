import { NextResponse } from "next/server";
import {
  isDharmaPgApproved,
  isDharmaTestPurchaseEnabled,
} from "@/lib/pg-download-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const pgApproved = isDharmaPgApproved();

  return NextResponse.json(
    {
      ok: true,
      pgApproved,
      materialSearchAllowed: true,
      materialDetailAllowed: true,
      downloadMode: pgApproved
        ? "payment-and-purchase-verification-required"
        : "all-downloads-blocked",
      paymentRequiredAfterPgApproval: true,
      testPurchaseEnabled: isDharmaTestPurchaseEnabled(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
