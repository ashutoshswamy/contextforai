import DocsContent from "./DocsContent";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "API Reference | contextforai",
  description: "contextforai API reference: authentication, the seven extraction endpoints, request and response schemas, credits, rate limits and error codes.",
  path: "/docs",
});

export default function DocsPage() {
  return <DocsContent />;
}
