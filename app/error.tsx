"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-3xl font-extrabold text-ink">Something went wrong.</h1>
      <p className="text-sm text-muted max-w-md">
        The request failed unexpectedly. Try again, or head back home if it keeps happening.
      </p>
      <div className="flex gap-3 mt-2">
        <Button onClick={() => reset()}>
          Try again
        </Button>
        <Button variant="outline" asChild>
          <a href="/">Go home</a>
        </Button>
      </div>
    </div>
  );
}
