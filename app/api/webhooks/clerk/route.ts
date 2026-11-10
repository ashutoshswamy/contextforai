import { Webhook } from "svix";
import { NextRequest } from "next/server";
import sql from "@/lib/db";
import { saveLegalConsent } from "@/lib/legal";

interface ClerkEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    unsafe_metadata?: { legal?: { over18?: boolean; tosAcceptedAt?: string; version?: string } };
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook secret not configured", { status: 500 });

  const svixId = request.headers.get("svix-id");
  const svixTs = request.headers.get("svix-timestamp");
  const svixSig = request.headers.get("svix-signature");
  if (!svixId || !svixTs || !svixSig)
    return new Response("Missing svix headers", { status: 400 });

  const body = await request.text();
  let evt: ClerkEvent;
  try {
    evt = new Webhook(secret).verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTs,
      "svix-signature": svixSig,
    }) as ClerkEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (evt.type !== "user.created") return new Response("OK");

  const clerkId = evt.data?.id;
  if (typeof clerkId !== "string" || !clerkId) {
    return new Response("Malformed event payload", { status: 400 });
  }
  const email = evt.data.email_addresses?.[0]?.email_address ?? "";

  // Upsert user + plan
  const rows = await sql`
    INSERT INTO users (clerk_id, email)
    VALUES (${clerkId}, ${email})
    ON CONFLICT (clerk_id) DO UPDATE SET email = EXCLUDED.email
    RETURNING id
  `;
  const userId = rows[0].id as number;

  await sql`
    INSERT INTO user_plans (user_id)
    VALUES (${userId})
    ON CONFLICT (user_id) DO NOTHING
  `;

  // Consent captured at sign-up. Never fail provisioning over it; /api/user/consent backfills.
  const legal = evt.data.unsafe_metadata?.legal;
  if (legal?.over18 === true) {
    try {
      await saveLegalConsent(clerkId, legal.tosAcceptedAt, legal.version);
    } catch (e) {
      console.error("legal consent save failed", e);
    }
  }

  return new Response("OK");
}
