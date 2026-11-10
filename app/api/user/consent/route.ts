import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { saveLegalConsent } from "@/lib/legal";
import { checkUserActionLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkUserActionLimit(clerkId, "consent", 20);
  if (!rl.allowed) {
    return Response.json({ error: "RATE_LIMITED" }, { status: 429, headers: { "Retry-After": String(rl.resetSec) } });
  }

  const body = await request.json().catch(() => null);
  if (body?.over18 !== true) {
    return Response.json({ error: "Age confirmation required" }, { status: 400 });
  }

  const saved = await saveLegalConsent(clerkId, body.tosAcceptedAt, body.version);
  if (!saved) return Response.json({ error: "User not provisioned yet" }, { status: 404 });
  return Response.json({ saved: true });
}
