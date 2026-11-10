import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import sql from "@/lib/db";
import Sidebar from "@/app/components/dashboard/Sidebar";
import AutoRefresh from "@/app/components/dashboard/AutoRefresh";
import ConsentSync from "@/app/components/dashboard/ConsentSync";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId: clerkId } = await auth();
  let credits = 0;
  let totalCredits = 0;
  
  if (clerkId) {
    const rows = await sql`
      SELECT
        CASE WHEN cycle_reset_at <= NOW() THEN credits_monthly ELSE credits_balance END
          + CASE WHEN topup_expires_at > NOW() THEN topup_balance ELSE 0 END AS credits_balance,
        credits_monthly
      FROM user_plans up
      JOIN users u ON u.id = up.user_id
      WHERE u.clerk_id = ${clerkId}
    `;
    if (rows.length > 0) {
      credits = rows[0].credits_balance as number;
      totalCredits = rows[0].credits_monthly as number;
    }
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <AutoRefresh />
      <ConsentSync />
      <Sidebar credits={credits} totalCredits={totalCredits} />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">{children}</main>
    </div>
  );
}
