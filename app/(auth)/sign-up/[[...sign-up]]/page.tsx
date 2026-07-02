import type { Metadata } from "next";
import SignUpClient from "./SignUpClient";

export const metadata: Metadata = {
  title: "Sign up — contextforai",
  description: "Create a free contextforai account and get your API key.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return <SignUpClient />;
}
