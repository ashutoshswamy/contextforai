import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import sql from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Usage History — contextforai" };
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

async function getUserId(clerkId: string): Promise<number | null> {
  const rows = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
  return rows.length > 0 ? (rows[0].id as number) : null;
}

function StatusBadge({ code }: { code: number }) {
  const ok = code < 300;
  return (
    <span className={`font-mono text-xs ${ok ? "text-go" : "text-stop"}`}>
      {code}
    </span>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <TableHead className="px-4 py-2.5 text-left text-xs font-mono text-faint uppercase tracking-wide bg-raised whitespace-nowrap h-auto">
      {children}
    </TableHead>
  );
}

const ENDPOINT_DOT: Record<string, string> = {
  markdown:   "bg-prism-markdown",
  html:       "bg-prism-html",
  json:       "bg-prism-json",
  sitemap:    "bg-prism-sitemap",
  fonts:      "bg-prism-fonts",
  screenshot: "bg-prism-screenshot",
  branding:   "bg-prism-branding",
};

export default async function UsagePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const userId = await getUserId(clerkId);
  if (!userId) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted">No usage data yet. Make your first API call.</p>
      </div>
    );
  }

  const [summary] = await sql`
    SELECT
      COUNT(*)::int                                            AS total,
      COALESCE(SUM(credits_used), 0)::int                    AS credits,
      COUNT(*) FILTER (WHERE status_code < 300)::int         AS success,
      COUNT(*) FILTER (WHERE status_code >= 400)::int        AS errors,
      COALESCE(AVG(latency_ms), 0)::int                      AS avg_latency
    FROM usage_logs
    WHERE user_id = ${userId}
  `;

  const logs = await sql`
    SELECT
      ul.id,
      ul.endpoint,
      ul.target_url,
      ul.source,
      ul.status_code,
      ul.credits_used,
      ul.latency_ms,
      ul.created_at,
      k.key_prefix,
      k.name AS key_name
    FROM usage_logs ul
    LEFT JOIN api_keys k ON k.id = ul.api_key_id
    WHERE ul.user_id = ${userId}
    ORDER BY ul.created_at DESC
    LIMIT 500
  `;

  const total    = (summary?.total        as number) ?? 0;
  const credits  = (summary?.credits      as number) ?? 0;
  const success  = (summary?.success      as number) ?? 0;
  const errors   = (summary?.errors       as number) ?? 0;
  const avgLat   = (summary?.avg_latency  as number) ?? 0;
  const successPct = total > 0 ? Math.round((success / total) * 100) : 100;

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="mb-8">
        <p className="text-xs font-mono text-faint uppercase tracking-widest mb-1">Usage History</p>
        <h1 className="text-2xl font-semibold text-ink">All requests</h1>
        <p className="text-sm text-muted mt-0.5">Showing last {logs.length} of {total.toLocaleString()} total</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Total requests", value: total.toLocaleString() },
          { label: "Credits used",   value: credits.toLocaleString() },
          { label: "Success",        value: `${success.toLocaleString()} (${successPct}%)` },
          { label: "Errors",         value: errors.toLocaleString() },
          { label: "Avg latency",    value: `${avgLat}ms` },
        ].map((s) => (
          <Card key={s.label} className="border-border px-4 py-3 gap-0">
            <CardContent className="p-0">
              <p className="text-xs font-mono text-faint uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-lg font-mono font-semibold text-ink">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Log table */}
      <Card className="border-border p-0 gap-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold text-ink">Request log</p>
        </div>

        {logs.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-muted">No requests yet.</p>
            <p className="text-xs text-faint mt-1">Make your first API call to see usage here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <Th>Endpoint</Th>
                  <Th>URL</Th>
                  <Th>Mode</Th>
                  <Th>Status</Th>
                  <Th>Credits</Th>
                  <Th>Latency</Th>
                  <Th>Key</Th>
                  <Th>Time</Th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((r) => {
                  const ep = r.endpoint as string;
                  return (
                    <TableRow key={r.id as number} className="border-border/50 hover:bg-raised">
                      <TableCell className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ENDPOINT_DOT[ep] ?? "bg-faint"}`} />
                          <span className="font-mono text-xs text-muted">/v1/{ep}</span>
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 max-w-[240px]">
                        <span
                          className="font-mono text-xs text-faint truncate block"
                          title={(r.target_url as string) ?? ""}
                        >
                          {(r.target_url as string) ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 whitespace-nowrap">
                        {r.source === "playground" ? (
                          <Badge variant="outline" className="font-mono bg-sky/10 text-sky border-sky/20">
                            playground
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="font-mono bg-raised text-faint border-border">
                            api
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge code={r.status_code as number} />
                      </TableCell>
                      <TableCell className="px-4 py-3 font-mono text-xs text-faint">
                        {r.credits_used as number}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-mono text-xs text-faint">
                        {r.latency_ms ? `${r.latency_ms as number}ms` : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-mono text-xs text-faint">
                        {r.key_prefix
                          ? `${r.key_name as string} · ${r.key_prefix as string}••`
                          : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs text-faint whitespace-nowrap">
                        {new Date(r.created_at as string).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
