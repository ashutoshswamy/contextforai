import { Wordmark } from "./Navbar";

const LINKS = {
  Product: [
    { label: "Endpoints", href: "/#lines" },
    { label: "Quickstart", href: "/#quickstart" },
    { label: "Playground", href: "/playground" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Developers: [
    { label: "Documentation", href: "/docs" },
    { label: "API keys", href: "/dashboard/keys" },
    { label: "Analytics", href: "/dashboard/analytics" },
    { label: "Billing", href: "/dashboard/billing" },
  ],
  Legal: [
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="mt-20 bg-bar text-[#f0f3f5] lg:mt-28">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Wordmark />
            <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-[#f0f3f5]/70">Clean structured data from any URL. Built for AI pipelines.</p>
          </div>
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <p className="font-display text-base font-bold">{section}</p>
              <ul className="mt-3 space-y-2.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-sm text-[#f0f3f5]/70 transition-colors hover:text-white">{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 border-t border-white/15 pt-6 text-sm text-[#f0f3f5]/60">© {new Date().getFullYear()} contextforai. All rights reserved.</p>
      </div>
    </footer>
  );
}
