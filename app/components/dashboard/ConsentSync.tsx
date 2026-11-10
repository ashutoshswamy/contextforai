"use client";

import { useEffect } from "react";
import { LEGAL_KEY, useConsent, writeConsent } from "@/lib/consent";

const SYNCED_KEY = "legal-synced:v1";

/** Pushes the consent captured on the auth screen to the DB once the user is signed in. */
export default function ConsentSync() {
  const accepted = useConsent(LEGAL_KEY);
  const synced = useConsent(SYNCED_KEY);

  useEffect(() => {
    if (!accepted || synced !== null) return;
    fetch("/api/user/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tosAcceptedAt: accepted, over18: true }),
    })
      .then((r) => { if (r.ok) writeConsent(SYNCED_KEY, "1"); })
      .catch(() => {});
  }, [accepted, synced]);

  return null;
}
