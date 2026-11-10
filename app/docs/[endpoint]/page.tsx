import { notFound } from "next/navigation";
import DocsContent from "../DocsContent";
import { ENDPOINTS } from "../endpoints";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return ENDPOINTS.map((e) => ({ endpoint: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ endpoint: string }> }) {
  const { endpoint } = await params;
  const ep = ENDPOINTS.find((e) => e.id === endpoint);
  if (!ep) return {};
  return pageMeta({
    title: `${ep.path} API: ${ep.id} extraction | contextforai`,
    description: `${ep.summary} ${ep.cost} credits per call. Request fields, curl, Node, Python, Go and Rust examples, and a sample response.`,
    path: `/docs/${ep.id}`,
  });
}

export default async function EndpointDocsPage({ params }: { params: Promise<{ endpoint: string }> }) {
  const { endpoint } = await params;
  if (!ENDPOINTS.some((e) => e.id === endpoint)) notFound();
  return <DocsContent only={endpoint} />;
}
