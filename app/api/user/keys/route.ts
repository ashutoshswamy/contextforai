import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import sql from "@/lib/db";
import { generateApiKey } from "@/lib/auth";
import { checkUserActionLimit } from "@/lib/ratelimit";

async function getUserId(clerkId: string): Promise<number | null> {
  const rows = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
  return rows.length > 0 ? (rows[0].id as number) : null;
}

function rateLimited(resetSec: number) {
  return Response.json(
    { error: "RATE_LIMITED", message: "Too many requests. Slow down." },
    { status: 429, headers: { "Retry-After": String(resetSec) } }
  );
}

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkUserActionLimit(clerkId, "keys:list", 30);
  if (!rl.allowed) return rateLimited(rl.resetSec);

  const userId = await getUserId(clerkId);
  if (!userId) return Response.json({ keys: [] });

  const keys = await sql`
    SELECT id, key_prefix, name, created_at, last_used_at, is_active
    FROM api_keys
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return Response.json({ keys });
}

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkUserActionLimit(clerkId, "keys:create", 10);
  if (!rl.allowed) return rateLimited(rl.resetSec);

  const userId = await getUserId(clerkId);
  if (!userId) return Response.json({ error: "User not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const trimmed = typeof body.name === "string" ? body.name.trim() : "";
  const name = trimmed ? trimmed.slice(0, 100) : "Default";

  const { key, hash, prefix } = generateApiKey();

  await sql`
    INSERT INTO api_keys (user_id, key_hash, key_prefix, name)
    VALUES (${userId}, ${hash}, ${prefix}, ${name})
  `;

  // Return full key ONCE - never stored in plaintext
  return Response.json({ key, prefix, name });
}

export async function DELETE(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkUserActionLimit(clerkId, "keys:revoke", 15);
  if (!rl.allowed) return rateLimited(rl.resetSec);

  const userId = await getUserId(clerkId);
  if (!userId) return Response.json({ error: "User not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get("id");
  const keyIdNum = keyId ? parseInt(keyId, 10) : NaN;
  if (!keyId || Number.isNaN(keyIdNum)) {
    return Response.json({ error: "Missing or invalid key id" }, { status: 400 });
  }

  await sql`
    UPDATE api_keys SET is_active = false
    WHERE id = ${keyIdNum} AND user_id = ${userId}
  `;

  return Response.json({ ok: true });
}
