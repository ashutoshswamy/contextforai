import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Zap, Calendar, TrendingUp, Key, ArrowUpRight } from "lucide-react";
import sql from "@/lib/db";
import AnimatedStat from "@/app/components/dashboard/AnimatedStat";

export const metadata: Metadata = { title: "Dashboard — contextforai" };
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

async function ensureUser(clerkId: string, email: string): Promise<number> {
  const rows = await sql`
    INSERT INTO users (clerk_id, email)
    VALUES (${clerkId}, ${email})
    ON CONFLICT (clerk_id) DO UPDATE SET email = EXCLUDED.email
    RETURNING id
  `;
  const userId = rows[0].id as number;
  await sql`INSERT INTO user_plans (user_id) VALUES (${userId}) ON CONFLICT DO NOTHING`;
  return userId;
}

function CreditRing({ balance, total }: { balance: number; total: number }) {
  const used = Math.max(0, total - balance);
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const deg = pct * 3.6;
  return (
    <div className="relative w-28 h-28 shrink-0">
      <div
        className="w-28 h-28 rounded-full"
        style={{ background: `conic-gradient(var(--color-ember) ${deg}deg, var(--color-raised) 0deg)` }}
      />
      <div className="absolute inset-2 bg-bg rounded-full flex flex-col items-center justify-center">
        <span className="text-xl font-mono font-bold text-ink leading-none">
          {balance.toLocaleString()}
        </span>
        <span className="text-[10px] font-mono text-muted mt-0.5">credits</span>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  const dbUserId = await ensureUser(clerkId, email);

  const [plan] = await sql`
    SELECT plan,
      CASE WHEN cycle_reset_at <= NOW() THEN credits_monthly ELSE credits_balance END
        + CASE WHEN topup_expires_at > NOW() THEN topup_balance ELSE 0 END AS credits_balance,
      credits_monthly, cycle_reset_at
    FROM user_plans WHERE user_id = ${dbUserId}
  `;
  const [today] = await sql`
    SELECT COUNT(*)::int AS count FROM usage_logs
    WHERE user_id = ${dbUserId} AND created_at >= CURRENT_DATE
  `;
  const [month] = await sql`
    SELECT COUNT(*)::int AS count, COALESCE(SUM(credits_used), 0)::int AS credits
    FROM usage_logs
    WHERE user_id = ${dbUserId} AND created_at >= date_trunc('month', NOW())
  `;
  const [keyCount] = await sql`
    SELECT COUNT(*)::int AS count FROM api_keys
    WHERE user_id = ${dbUserId} AND is_active = true
  `;
  const recent = await sql`
    SELECT ul.endpoint, ul.status_code, ul.credits_used, ul.latency_ms,
           ul.created_at, k.key_prefix
    FROM usage_logs ul
    LEFT JOIN api_keys k ON k.id = ul.api_key_id
    WHERE ul.user_id = ${dbUserId}
    ORDER BY ul.created_at DESC
    LIMIT 10
  `;

  const balance = (plan?.credits_balance as number) ?? 500;
  const monthly = (plan?.credits_monthly as number) ?? 500;

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="mb-8">
        <p className="text-xs font-mono text-faint uppercase tracking-widest mb-1">Dashboard</p>
        <h1 className="text-2xl font-semibold text-ink">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-sm text-muted mt-0.5">
          {plan?.plan ?? "free"} plan
          {plan?.cycle_reset_at
            ? ` · resets ${new Date(plan.cycle_reset_at as string).toLocaleDateString()}`
            : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Card className="col-span-2 border-border p-5 flex-row items-center gap-6">
          <CreditRing balance={balance} total={monthly} />
          <CardContent className="p-0">
            <p className="text-xs font-mono text-faint uppercase tracking-widest mb-1">Credits remaining</p>
            <p className="text-3xl font-mono font-bold text-ink">{balance.toLocaleString()}</p>
            <p className="text-xs text-faint mt-1">of {monthly.toLocaleString()} monthly</p>
            <Button variant="link" asChild className="px-0 h-auto mt-3 text-xs font-mono text-ember hover:text-ember-hi">
              <a href="/dashboard/billing">
                Top up <ArrowUpRight size={12} />
              </a>
            </Button>
          </CardContent>
        </Card>
        <AnimatedStat label="Today" value={(today?.count as number) ?? 0} unit="requests" icon={<Zap size={16} />} />
        <AnimatedStat label="This month" value={(month?.count as number) ?? 0} unit="requests" icon={<Calendar size={16} />} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <AnimatedStat label="Credits used" value={(month?.credits as number) ?? 0} unit="this month" icon={<TrendingUp size={16} />} />
        <AnimatedStat label="API keys" value={(keyCount?.count as number) ?? 0} unit="active" icon={<Key size={16} />} />
        <Card className="col-span-2 border-border p-5 gap-0 flex-row items-center justify-between">
          <div>
            <p className="text-xs font-mono text-faint uppercase tracking-widest mb-1">Plan</p>
            <p className="text-lg font-mono font-semibold text-ink capitalize">{plan?.plan ?? "free"}</p>
          </div>
          <Button asChild className="text-xs font-mono bg-ember hover:bg-ember-hi text-white">
            <a href="/dashboard/billing">Upgrade</a>
          </Button>
        </Card>
      </div>

      <Card className="border-border p-0 gap-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Recent requests</p>
          <Button variant="link" asChild className="px-0 h-auto text-xs text-ember hover:text-ember-hi font-mono">
            <a href="/dashboard/analytics">
              View all <ArrowUpRight size={12} />
            </a>
          </Button>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted">No requests yet.</p>
            <p className="text-xs text-faint mt-1">Create an API key and make your first extraction.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <Th>Endpoint</Th>
                <Th>Status</Th>
                <Th>Credits</Th>
                <Th>Latency</Th>
                <Th>Time</Th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((r, i) => (
                <TableRow key={i} className="border-border/60 hover:bg-raised">
                  <TableCell className="px-5 py-3 font-mono text-xs text-muted">/v1/{r.endpoint as string}</TableCell>
                  <TableCell className="px-5 py-3">
                    <span className={`font-mono text-xs ${(r.status_code as number) < 300 ? "text-go" : "text-stop"}`}>
                      {r.status_code as number}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-3 font-mono text-xs text-muted">{r.credits_used as number}</TableCell>
                  <TableCell className="px-5 py-3 font-mono text-xs text-faint">{r.latency_ms ? `${r.latency_ms}ms` : "—"}</TableCell>
                  <TableCell className="px-5 py-3 text-xs text-faint whitespace-nowrap">
                    {new Date(r.created_at as string).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <TableHead className="px-5 py-2.5 text-left text-xs font-mono text-faint uppercase tracking-wide bg-raised h-auto">
      {children}
    </TableHead>
  );
}
