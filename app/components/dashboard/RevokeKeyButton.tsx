"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RevokeKeyButton({ keyId }: { keyId: number }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function revoke() {
    setLoading(true);
    await fetch(`/api/user/keys?id=${keyId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 justify-end">
        <span className="text-xs text-faint">Revoke?</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={revoke}
          disabled={loading}
          className="h-auto p-0 text-xs text-stop hover:text-stop/80 hover:bg-transparent font-mono disabled:opacity-50"
        >
          {loading ? "…" : "Yes"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
          className="h-auto p-0 text-xs text-faint hover:text-muted hover:bg-transparent font-mono"
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setConfirming(true)}
      className="h-auto p-0 text-xs text-faint hover:text-stop hover:bg-transparent font-mono transition-colors"
    >
      Revoke
    </Button>
  );
}
