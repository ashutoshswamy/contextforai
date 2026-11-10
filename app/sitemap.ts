import type { MetadataRoute } from "next";
import { ENDPOINTS } from "./docs/endpoints";

const BASE_URL = "https://contextforai.ashutoshswamy.in";

// Update lastModified when a page's content actually changes.
const routes = [
  { path: "", priority: 1, lastModified: "2026-11-10" },
  { path: "/docs", priority: 0.8, lastModified: "2026-11-10" },
  ...ENDPOINTS.map((e) => ({ path: `/docs/${e.id}`, priority: 0.7, lastModified: "2026-11-10" })),
  { path: "/privacy", priority: 0.3, lastModified: "2026-07-01" },
  { path: "/terms", priority: 0.3, lastModified: "2026-11-10" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority, lastModified }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(lastModified),
    priority,
  }));
}
