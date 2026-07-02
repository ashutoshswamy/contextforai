import type { Metadata } from "next";
import SignInClient from "./SignInClient";

export const metadata: Metadata = {
  title: "Sign in — contextforai",
  description: "Sign in to your contextforai account.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return <SignInClient />;
}
