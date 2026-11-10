import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Key, CheckCircle, Circle } from "lucide-react";
import sql from "@/lib/db";
import CreateKeyModal from "@/app/components/dashboard/CreateKeyModal";

export const metadata: Metadata = { title: "API Keys - contextforai" };
import RevokeKeyButton from "@/app/components/dashboard/RevokeKeyButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

async function getUserId(clerkId: string): Promise<number | null> {
  const rows = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
  return rows.length > 0 ? (rows[0].id as number) : null;
}

export default async function KeysPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const userId = await getUserId(clerkId);
  const keys = userId
    ? await sql`
        SELECT id, key_prefix, name, created_at, last_used_at, is_active
        FROM api_keys
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `
    : [];

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-faint mb-1">API Keys</p>
          <h1 className="text-2xl font-semibold text-ink">Your API keys</h1>
          <p className="text-sm text-muted mt-1">
            Keys grant access to all endpoints. Each key is shown only once.
          </p>
        </div>
        <CreateKeyModal />
      </div>

      {keys.length === 0 ? (
        <Card className="border-border px-6 py-16 text-center">
          <CardContent className="p-0">
            <Key size={32} className="text-faint mx-auto mb-3" />
            <p className="text-muted text-sm mb-2">No API keys yet.</p>
            <p className="text-xs text-faint">Create a key to start making extraction requests.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border p-0 gap-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <Th>Name</Th>
                <Th>Key prefix</Th>
                <Th>Created</Th>
                <Th>Last used</Th>
                <Th>Status</Th>
                <Th />
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow key={k.id as number} className="border-border/60 hover:bg-raised">
                  <TableCell className="px-5 py-3.5 text-ink font-medium text-sm">{k.name as string}</TableCell>
                  <TableCell className="px-5 py-3.5">
                    <span className="font-mono text-xs bg-raised border border-border px-2 py-1 rounded text-muted">
                      {k.key_prefix as string}••••••••
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-xs text-faint">
                    {new Date(k.created_at as string).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-xs text-faint">
                    {k.last_used_at ? new Date(k.last_used_at as string).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="px-5 py-3.5">
                    <Badge
                      variant="outline"
                      className={`gap-1.5 font-mono ${
                        k.is_active
                          ? "bg-go/10 text-go border-go/20"
                          : "bg-raised text-faint border-border"
                      }`}
                    >
                      {k.is_active ? <CheckCircle size={11} /> : <Circle size={11} />}
                      {k.is_active ? "active" : "revoked"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-right">
                    {k.is_active && <RevokeKeyButton keyId={k.id as number} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Card className="mt-6 border-border p-5">
        <CardContent className="p-0">
          <p className="text-xs font-mono text-faint mb-2">Usage</p>
          <pre className="text-xs font-mono text-muted leading-relaxed">{`curl -X POST /api/v1/markdown \\
  -H "Authorization: Bearer cfai_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}</pre>
        </CardContent>
      </Card>
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
