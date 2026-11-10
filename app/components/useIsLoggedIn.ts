"use client";

import { useAuth } from "@clerk/nextjs";

/** Client-side so marketing pages can be statically rendered (server auth() forces dynamic, uncached HTML). */
export function useIsLoggedIn() {
  return useAuth().isSignedIn === true;
}
