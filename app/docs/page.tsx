import { auth } from "@clerk/nextjs/server";
import DocsContent from "./DocsContent";

export const metadata = {
  title: "API Reference — contextforai",
  description: "Full API reference for contextforai. Authentication, endpoints, request/response schemas, error codes.",
  alternates: { canonical: "/docs" },
};

export default async function DocsPage() {
  const { userId } = await auth();
  return <DocsContent isLoggedIn={!!userId} />;
}
