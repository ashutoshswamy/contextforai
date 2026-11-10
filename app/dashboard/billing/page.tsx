import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import sql from "@/lib/db";
import BillingCheckout from "@/app/components/dashboard/BillingCheckout";
import PlanPicker from "@/app/components/dashboard/PlanPicker";

export const metadata: Metadata = { title: "Billing - contextforai" };
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const FREE_RATE_LIMIT = "20 requests/min (10 for screenshot/branding)";

// Priced at ~₹0.05/credit, matching the Starter plan rate (₹499/10,000) - no
// commitment discount, so topups never undercut subscribing to a plan.
const TOPUPS = [
  { id: "topup_500", credits: 500, price: "₹25" },
  { id: "topup_2000", credits: 2000, price: "₹99" },
  { id: "topup_10000", credits: 10000, price: "₹499" },
];

async function getUserData(clerkId: string) {
  const [user] = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
  if (!user) return null;

  const [plan] = await sql`
    SELECT plan,
      CASE WHEN cycle_reset_at <= NOW() THEN credits_monthly ELSE credits_balance END
        + CASE WHEN topup_expires_at > NOW() THEN topup_balance ELSE 0 END AS credits_balance,
      credits_monthly
    FROM user_plans WHERE user_id = ${user.id as number}
  `;

  const orders = await sql`
    SELECT id, product_id, credits, amount, status, created_at
    FROM orders
    WHERE user_id = ${user.id as number}
    ORDER BY created_at DESC
    LIMIT 10
  `;

  return { plan, orders };
}

export default async function BillingPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const data = await getUserData(clerkId);
  const currentPlan = (data?.plan?.plan as string) ?? "free";
  const balance = (data?.plan?.credits_balance as number) ?? 500;

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="mb-8">
        <p className="text-xs font-mono text-faint mb-1">Billing</p>
        <h1 className="text-2xl font-semibold text-ink">Plans & Credits</h1>
        <p className="text-sm text-muted mt-1">
          Current plan:{" "}
          <span className="font-mono text-ink capitalize">{currentPlan}</span>
          {" · "}
          <span className="font-mono text-ink">{balance.toLocaleString()} credits</span> remaining
        </p>
        {currentPlan === "free" && (
          <p className="text-xs font-mono text-faint mt-1">Rate limit: {FREE_RATE_LIMIT}</p>
        )}
      </div>

      {/* Plans */}
      <div className="mb-8">
        <PlanPicker currentPlan={currentPlan} />
      </div>

      {/* Top-ups */}
      <div className="mb-8">
        <p className="text-xs font-mono text-faint mb-1">
          Credit top-ups
        </p>
        <p className="text-xs text-faint mb-4">Expire 30 days after purchase.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TOPUPS.map((t) => (
            <Card key={t.id} className="border-border p-4">
              <CardContent className="p-0">
                <p className="text-xl font-mono font-bold text-ink">
                  {t.credits.toLocaleString()}
                </p>
                <p className="text-xs text-faint mb-4">credits</p>
                <BillingCheckout
                  productId={t.id}
                  label={`${t.credits.toLocaleString()} Credits`}
                  priceDisplay={t.price}
                  credits={t.credits}
                  className="w-full py-1.5 text-xs font-mono bg-raised border border-border hover:border-ember text-muted hover:text-ink rounded-lg transition-colors"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      {data?.orders && data.orders.length > 0 && (
        <Card className="border-border p-0 gap-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold text-ink">Transaction history</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <Th>Product</Th>
                <Th>Credits</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Date</Th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.orders.map((o) => (
                <TableRow key={o.id as string} className="border-border/40 hover:bg-raised">
                  <TableCell className="px-5 py-3 text-xs font-mono text-muted">
                    {o.product_id as string}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-xs font-mono text-faint">
                    +{(o.credits as number).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-xs font-mono text-faint">
                    ₹{((o.amount as number) / 100).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <Badge
                      variant="outline"
                      className={`font-mono ${
                        o.status === "paid"
                          ? "bg-go/10 text-go border-go/20"
                          : "bg-raised text-faint border-transparent"
                      }`}
                    >
                      {o.status as string}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-xs text-faint">
                    {new Date(o.created_at as string).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <TableHead className="px-5 py-2.5 text-left text-xs font-mono text-faint bg-raised h-auto">
      {children}
    </TableHead>
  );
}
