import { ArrowUpRight } from "lucide-react";
import { LINES } from "./landing/lines";

// Pane width carries price: 5-credit endpoints take 2 of 8 columns, 10-credit ones take 3 (fonts shares the short row).
const SPAN: Record<string, string> = {
  markdown: "lg:col-span-2",
  html: "lg:col-span-2",
  json: "lg:col-span-2",
  sitemap: "lg:col-span-2",
  fonts: "lg:col-span-2",
  screenshot: "lg:col-span-3",
  branding: "md:col-span-2 lg:col-span-3",
};

export default function EndpointsSection() {
  return (
    <section id="endpoints" className="scroll-mt-14 bg-bg pt-20 lg:pt-28">
      <div className="wall mx-auto max-w-[1400px] md:grid-cols-2 lg:grid-cols-8">
        <div className="pane p-6 sm:p-10 md:col-span-2 lg:col-span-8">
          <h2 className="max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">Seven endpoints. Two prices.</h2>
          <p className="mt-4 max-w-xl text-lg text-muted">The amber panes cost 10 credits a call, the rest cost 5. Errors are never charged.</p>
        </div>
        {LINES.map((l) => (
          <a key={l.id} href={`/docs/${l.id}`} data-glass={l.cost === 10 ? "amber" : undefined} className={`pane group flex min-h-56 flex-col justify-between gap-8 p-6 ${SPAN[l.id]}`}>
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-2xl font-bold">{l.name}</h3>
                <ArrowUpRight data-arrow size={18} className="mt-1 shrink-0 opacity-40 transition-opacity group-hover:opacity-100" aria-hidden />
              </div>
              <p className="mt-1 text-sm font-semibold opacity-75">{l.method} {l.path}</p>
              <p className="mt-4 max-w-sm opacity-80">{l.description}</p>
            </div>
            <span className="credit-chip self-start">{l.cost} credits</span>
          </a>
        ))}
      </div>
    </section>
  );
}
