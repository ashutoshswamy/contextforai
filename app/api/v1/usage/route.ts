import { NextRequest } from "next/server";
import sql from "@/lib/db";
import { validateApiKey } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request, "usage");
  if (!auth.valid) return auth.response;

  const [plan] = await sql`
    SELECT plan,
      CASE WHEN cycle_reset_at <= NOW() THEN credits_monthly ELSE credits_balance END
        + CASE WHEN topup_expires_at > NOW() THEN topup_balance ELSE 0 END AS credits_balance,
      credits_monthly, cycle_reset_at
    FROM user_plans WHERE user_id = ${auth.userId}
  `;

  const usage = await sql`
    SELECT endpoint, SUM(credits_used)::int AS credits
    FROM usage_logs
    WHERE user_id = ${auth.userId}
      AND created_at >= date_trunc('month', NOW())
    GROUP BY endpoint
  `;

  const byEndpoint = Object.fromEntries(
    usage.map((r) => [r.endpoint as string, r.credits as number])
  );

  return Response.json({
    plan: plan?.plan ?? "free",
    balance: plan?.credits_balance ?? 0,
    monthlyAllowance: plan?.credits_monthly ?? 500,
    cycleResetsAt: plan?.cycle_reset_at ?? null,
    usageByEndpoint: {
      markdown:   byEndpoint.markdown   ?? 0,
      html:       byEndpoint.html       ?? 0,
      json:       byEndpoint.json       ?? 0,
      sitemap:    byEndpoint.sitemap    ?? 0,
      fonts:      byEndpoint.fonts      ?? 0,
      screenshot: byEndpoint.screenshot ?? 0,
      branding:   byEndpoint.branding   ?? 0,
    },
  });
}
