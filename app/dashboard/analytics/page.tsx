import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Zap, CheckCircle2, AlertTriangle, TrendingUp, Clock, ArrowUpRight } from "lucide-react";
import sql from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Analytics - contextforai" };
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

async function getUserId(clerkId: string): Promise<number | null> {
  const rows = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
  return rows.length > 0 ? (rows[0].id as number) : null;
}

const EP_COLOR: Record<string, { bar: string; dot: string; text: string; var: string }> = {
  markdown:   { bar: "bg-prism-markdown",   dot: "bg-prism-markdown",   text: "text-prism-markdown",   var: "--color-prism-markdown"   },
  html:       { bar: "bg-prism-html",       dot: "bg-prism-html",       text: "text-prism-html",       var: "--color-prism-html"       },
  json:       { bar: "bg-prism-json",       dot: "bg-prism-json",       text: "text-prism-json",       var: "--color-prism-json"       },
  sitemap:    { bar: "bg-prism-sitemap",    dot: "bg-prism-sitemap",    text: "text-prism-sitemap",    var: "--color-prism-sitemap"    },
  fonts:      { bar: "bg-prism-fonts",      dot: "bg-prism-fonts",      text: "text-prism-fonts",      var: "--color-prism-fonts"      },
  screenshot: { bar: "bg-prism-screenshot", dot: "bg-prism-screenshot", text: "text-prism-screenshot", var: "--color-prism-screenshot" },
  branding:   { bar: "bg-prism-branding",   dot: "bg-prism-branding",   text: "text-prism-branding",   var: "--color-prism-branding"   },
};
const EP_FALLBACK = { bar: "bg-faint", dot: "bg-faint", text: "text-faint", var: "--color-faint" };

/* ── Heatmap ── */
function Heatmap({ data }: { data: Record<string, number> }) {
  const days = Array.from({ length: 84 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 83 + i);
    const key = d.toISOString().split("T")[0];
    return { date: key, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), count: data[key] ?? 0, weekday: d.getDay() };
  });
  const max = Math.max(...days.map((d) => d.count), 1);

  function cell(count: number) {
    if (count === 0) return "bg-raised border border-border/60";
    const p = count / max;
    if (p < 0.25) return "bg-ember/20 border border-ember/20";
    if (p < 0.5)  return "bg-ember/45 border border-ember/30";
    if (p < 0.75) return "bg-ember/70 border border-ember/40";
    return "bg-primary border border-ember/60";
  }

  // Month labels - find first day of each new month among our 12 weeks
  const weeks = Array.from({ length: 12 }, (_, w) => days.slice(w * 7, w * 7 + 7));
  const monthLabels = weeks.map((week) => {
    const firstOfMonth = week.find((d) => new Date(d.date).getDate() <= 7);
    return firstOfMonth
      ? new Date(firstOfMonth.date).toLocaleDateString("en-US", { month: "short" })
      : "";
  });

  return (
    <div>
      {/* Month row */}
      <div className="flex gap-1 mb-1 pl-6">
        {monthLabels.map((m, i) => (
          <div key={i} className="w-3.5 text-[9px] font-mono text-faint shrink-0">{m}</div>
        ))}
      </div>
      <div className="flex gap-1">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-1 mr-0.5">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <div key={i} className="h-3.5 w-4 text-[9px] font-mono text-faint/60 flex items-center">{i % 2 === 1 ? d : ""}</div>
          ))}
        </div>
        {/* Grid */}
        <div className="flex gap-1 overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.label}: ${day.count} requests`}
                  className={`w-3.5 h-3.5 rounded-sm cursor-default ${cell(day.count)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-[10px] font-mono text-faint">less</span>
        {["bg-raised border-border/60","bg-ember/20","bg-ember/45","bg-ember/70","bg-primary"].map((c, i) => (
          <span key={i} className={`w-3 h-3 rounded-sm inline-block border border-transparent ${c}`} />
        ))}
        <span className="text-[10px] font-mono text-faint">more</span>
      </div>
    </div>
  );
}

/* ── Mini bar chart (last 14 days) ── */
function SparkBars({ data }: { data: Record<string, number> }) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 13 + i);
    const key = d.toISOString().split("T")[0];
    return {
      key,
      label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      count: data[key] ?? 0,
    };
  });
  const max = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1 h-20">
      {days.map((d) => (
        <div key={d.key} className="flex-1 h-full flex flex-col items-center justify-end gap-1 group relative" title={`${d.label}: ${d.count}`}>
          <div
            className="w-full rounded-sm bg-ember/70 group-hover:bg-primary transition-colors"
            style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 8 : 2)}%` }}
          />
          {d.count > 0 && (
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-faint opacity-0 group-hover:opacity-100 whitespace-nowrap bg-surface border border-border px-1 py-0.5 rounded z-10">
              {d.count}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Endpoint distribution donut ── */
function EndpointDonut({ stats }: { stats: { endpoint: string; requests: number }[] }) {
  const total = stats.reduce((s, r) => s + r.requests, 0) || 1;
  let acc = 0;
  const stops = stats.map((s) => {
    const c = EP_COLOR[s.endpoint] ?? EP_FALLBACK;
    const start = (acc / total) * 360;
    acc += s.requests;
    const end = (acc / total) * 360;
    return `var(${c.var}) ${start}deg ${end}deg`;
  });
  const gradient = stops.length > 0 ? `conic-gradient(${stops.join(", ")})` : "var(--color-raised)";

  return (
    <div className="flex items-center gap-5 mb-5">
      <div className="relative w-24 h-24 shrink-0">
        <div className="w-24 h-24 rounded-full" style={{ background: gradient }} />
        <div className="absolute inset-2 bg-surface rounded-full flex flex-col items-center justify-center">
          <span className="text-sm font-mono font-bold text-ink">{total.toLocaleString()}</span>
          <span className="text-[9px] font-mono text-faint">requests</span>
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        {stats.map((s) => {
          const c = EP_COLOR[s.endpoint] ?? EP_FALLBACK;
          const pct = Math.round((s.requests / total) * 100);
          return (
            <div key={s.endpoint} className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
              <span className="font-mono text-muted truncate flex-1">/v1/{s.endpoint}</span>
              <span className="font-mono text-faint tabular-nums">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Ranked bar ── */
function RankedBar({ label, sub, requests, credits, pct, color }: {
  label: string; sub?: string; requests: number; credits?: number; pct: number; color: string;
}) {
  return (
    <div>
      <div className="flex items-start justify-between mb-1.5 gap-3 min-w-0">
        <div className="min-w-0">
          <span className="text-xs font-mono text-muted truncate block">{label}</span>
          {sub && <span className="text-[10px] font-mono text-faint truncate block">{sub}</span>}
        </div>
        <div className="flex gap-3 text-xs font-mono text-faint shrink-0 tabular-nums">
          <span>{requests.toLocaleString()} req</span>
          {credits !== undefined && <span>{credits.toLocaleString()} cr</span>}
        </div>
      </div>
      <div className="h-1 bg-raised rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, sub, icon, accent = false }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; accent?: boolean;
}) {
  return (
    <Card className={`p-4 gap-3 ${accent ? "bg-ember/5 border-ember/20" : "border-border"}`}>
      <CardContent className="p-0 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-faint ">{label}</p>
          <span className={`${accent ? "text-ember" : "text-faint"}`}>{icon}</span>
        </div>
        <div>
          <p className={`text-2xl font-mono font-bold ${accent ? "text-ember" : "text-ink"}`}>{value}</p>
          {sub && <p className="text-xs text-faint mt-0.5 font-mono">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <TableHead className="px-4 py-2.5 text-left text-xs font-mono text-faint bg-raised whitespace-nowrap h-auto">
      {children}
    </TableHead>
  );
}

export default async function AnalyticsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const userId = await getUserId(clerkId);
  if (!userId) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted">No data yet. Make your first API call to see analytics.</p>
      </div>
    );
  }

  const [summary] = await sql`
    SELECT COUNT(*)::int AS requests,
           COALESCE(SUM(credits_used), 0)::int AS credits,
           COALESCE(AVG(latency_ms), 0)::int AS avg_latency,
           COUNT(*) FILTER (WHERE status_code >= 400)::int AS errors
    FROM usage_logs
    WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '30 days'
  `;

  const endpointStats = await sql`
    SELECT endpoint,
           COUNT(*)::int AS requests,
           COALESCE(SUM(credits_used), 0)::int AS credits,
           AVG(latency_ms)::int AS avg_latency
    FROM usage_logs
    WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY endpoint
    ORDER BY requests DESC
  `;

  const dailyStats = await sql`
    SELECT DATE(created_at)::text AS day, COUNT(*)::int AS requests
    FROM usage_logs
    WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '84 days'
    GROUP BY DATE(created_at)
  `;

  const topUrls = await sql`
    SELECT target_url, COUNT(*)::int AS requests
    FROM usage_logs
    WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '30 days'
      AND target_url IS NOT NULL
    GROUP BY target_url
    ORDER BY requests DESC
    LIMIT 8
  `;

  const keyStats = await sql`
    SELECT k.id, k.key_prefix, k.name,
           COUNT(*)::int AS requests,
           COALESCE(SUM(ul.credits_used), 0)::int AS credits
    FROM usage_logs ul
    JOIN api_keys k ON k.id = ul.api_key_id
    WHERE ul.user_id = ${userId}
      AND ul.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY k.id, k.key_prefix, k.name
    ORDER BY requests DESC
  `;

  const recentLogs = await sql`
    SELECT ul.endpoint, ul.status_code, ul.credits_used, ul.latency_ms,
           ul.target_url, ul.created_at, k.key_prefix, k.name AS key_name
    FROM usage_logs ul
    LEFT JOIN api_keys k ON k.id = ul.api_key_id
    WHERE ul.user_id = ${userId}
    ORDER BY ul.created_at DESC
    LIMIT 50
  `;

  const heatmapData: Record<string, number> = {};
  dailyStats.forEach((r) => { heatmapData[r.day as string] = r.requests as number; });

  const totalReq    = (summary?.requests    as number) ?? 0;
  const totalErrors = (summary?.errors      as number) ?? 0;
  const totalCr     = (summary?.credits     as number) ?? 0;
  const avgLat      = (summary?.avg_latency as number) ?? 0;
  const successRate = totalReq > 0 ? Math.round(((totalReq - totalErrors) / totalReq) * 100) : 100;

  const maxEp  = Math.max(...endpointStats.map((r) => r.requests as number), 1);
  const maxUrl = Math.max(...topUrls.map((r) => r.requests as number), 1);
  const maxKey = Math.max(...keyStats.map((r) => r.requests as number), 1);

  return (
    <div className="p-4 md:p-8 w-full">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-mono text-faint mb-1">Analytics</p>
          <h1 className="text-2xl font-semibold text-ink">Usage overview</h1>
          <p className="text-sm text-muted mt-0.5">Last 30 days</p>
        </div>
        <Button variant="link" asChild className="px-0 h-auto text-xs font-mono text-ember hover:text-ember-hi mt-1">
          <a href="/dashboard/usage">
            Full history <ArrowUpRight size={12} />
          </a>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <StatCard label="Requests"    value={totalReq.toLocaleString()}  sub="last 30 days"    icon={<Zap size={14} />}          accent />
        <StatCard label="Success rate" value={`${successRate}%`}          sub={`${totalReq - totalErrors} succeeded`} icon={<CheckCircle2 size={14} />} />
        <StatCard label="Errors"       value={totalErrors.toLocaleString()} sub="4xx / 5xx"     icon={<AlertTriangle size={14} />} />
        <StatCard label="Credits used" value={totalCr.toLocaleString()}   sub="last 30 days"    icon={<TrendingUp size={14} />}   />
        <StatCard label="Avg latency"  value={`${avgLat}ms`}              sub="per request"     icon={<Clock size={14} />}        />
      </div>

      {/* Daily bar chart + heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 mb-6">
        <Card className="border-border p-5">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-ink">Daily requests</p>
              <span className="text-xs font-mono text-faint">last 14 days</span>
            </div>
            <SparkBars data={heatmapData} />
            <div className="flex justify-between mt-2">
              {Array.from({ length: 14 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - 13 + i);
                return (
                  <span key={i} className="flex-1 text-center text-[9px] font-mono text-faint/50">
                    {i % 2 === 0 ? d.getDate() : ""}
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border p-5">
          <CardContent className="p-0">
            <p className="text-sm font-semibold text-ink mb-4">Activity · 12 weeks</p>
            <Heatmap data={heatmapData} />
          </CardContent>
        </Card>
      </div>

      {/* Endpoint + key breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="border-border p-5">
          <CardContent className="p-0">
            <p className="text-sm font-semibold text-ink mb-5">By endpoint</p>
            {endpointStats.length === 0 ? (
              <p className="text-sm text-muted">No requests in the last 30 days.</p>
            ) : (
              <div className="space-y-5">
                <EndpointDonut
                  stats={endpointStats.map((ep) => ({ endpoint: ep.endpoint as string, requests: ep.requests as number }))}
                />
                {endpointStats.map((ep) => {
                  const c = EP_COLOR[ep.endpoint as string] ?? EP_FALLBACK;
                  return (
                    <RankedBar
                      key={ep.endpoint as string}
                      label={`/v1/${ep.endpoint as string}`}
                      requests={ep.requests as number}
                      credits={ep.credits as number}
                      pct={Math.round(((ep.requests as number) / maxEp) * 100)}
                      color={c.bar}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border p-5">
          <CardContent className="p-0">
            <p className="text-sm font-semibold text-ink mb-5">By API key</p>
            {keyStats.length === 0 ? (
              <p className="text-sm text-muted">No requests in the last 30 days.</p>
            ) : (
              <div className="space-y-5">
                {keyStats.map((k) => (
                  <RankedBar
                    key={k.id as number}
                    label={k.name as string}
                    sub={`${k.key_prefix as string}••`}
                    requests={k.requests as number}
                    credits={k.credits as number}
                    pct={Math.round(((k.requests as number) / maxKey) * 100)}
                    color="bg-primary"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top URLs */}
      {topUrls.length > 0 && (
        <Card className="border-border p-5 mb-6">
          <CardContent className="p-0">
            <p className="text-sm font-semibold text-ink mb-5">Top URLs</p>
            <div className="space-y-4">
              {topUrls.map((u) => (
                <RankedBar
                  key={u.target_url as string}
                  label={u.target_url as string}
                  requests={u.requests as number}
                  pct={Math.round(((u.requests as number) / maxUrl) * 100)}
                  color="bg-sky"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent log */}
      <Card className="border-border p-0 gap-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Recent requests</p>
          <Button variant="link" asChild className="px-0 h-auto text-xs font-mono text-ember hover:text-ember-hi">
            <a href="/dashboard/usage">
              View all <ArrowUpRight size={11} />
            </a>
          </Button>
        </div>
        {recentLogs.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted">No requests yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <Th>Endpoint</Th>
                  <Th>URL</Th>
                  <Th>Status</Th>
                  <Th>Credits</Th>
                  <Th>Latency</Th>
                  <Th>Key</Th>
                  <Th>Time</Th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs.map((r, i) => {
                  const ep  = r.endpoint as string;
                  const ok  = (r.status_code as number) < 300;
                  const c   = EP_COLOR[ep] ?? EP_FALLBACK;
                  return (
                    <TableRow key={i} className="border-border/50 hover:bg-raised">
                      <TableCell className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                          <span className="font-mono text-xs text-muted">/v1/{ep}</span>
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 max-w-[200px]">
                        <span className="font-mono text-xs text-faint truncate block" title={(r.target_url as string) ?? ""}>
                          {(r.target_url as string) ?? "-"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`font-mono font-semibold ${
                            ok ? "bg-go/10 text-go border-go/20" : "bg-stop/10 text-stop border-stop/20"
                          }`}
                        >
                          {r.status_code as number}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-mono text-xs text-faint tabular-nums">{r.credits_used as number}</TableCell>
                      <TableCell className="px-4 py-3 font-mono text-xs text-faint tabular-nums">
                        {r.latency_ms ? `${r.latency_ms as number}ms` : "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-mono text-xs text-faint">
                        {r.key_prefix ? `${r.key_name as string} · ${r.key_prefix as string}••` : "-"}
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
