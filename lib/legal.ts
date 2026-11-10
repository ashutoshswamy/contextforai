import sql from "@/lib/db";
import { LEGAL_VERSION } from "@/lib/legal-version";

/**
 * Persist the 18+ confirmation and ToS/Privacy acceptance for a Clerk user.
 * First acceptance wins. Returns false if the user row does not exist yet.
 */
export async function saveLegalConsent(clerkId: string, acceptedAt?: unknown, version?: unknown): Promise<boolean> {
  const t = typeof acceptedAt === "string" ? Date.parse(acceptedAt) : NaN;
  const at = new Date(Number.isNaN(t) || t > Date.now() ? Date.now() : t).toISOString();
  const ver = typeof version === "string" && version.length <= 32 ? version : LEGAL_VERSION;
  const rows = await sql`
    UPDATE users SET
      over_18 = true,
      tos_accepted_at = COALESCE(tos_accepted_at, ${at}::timestamptz),
      tos_version = COALESCE(tos_version, ${ver})
    WHERE clerk_id = ${clerkId}
    RETURNING id
  `;
  return rows.length > 0;
}
