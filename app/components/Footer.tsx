const LINKS = {
  Product: [
    { label: "Endpoints", href: "/#endpoints" },
    { label: "Quickstart", href: "/#quickstart" },
    { label: "Playground", href: "/playground" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Developers: [
    { label: "Documentation", href: "/docs" },
    { label: "API Keys", href: "/dashboard/keys" },
    { label: "Analytics", href: "/dashboard/analytics" },
    { label: "Billing", href: "/dashboard/billing" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Top: brand + columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <a
              href="/"
              className="inline-block mb-2 font-mono font-semibold transition-opacity hover:opacity-70 text-ink text-[15px]"
            >
              contextforai
            </a>
            <p
              className="leading-relaxed text-muted text-[13px] max-w-[200px]"
            >
              Clean structured data from any URL. Built for AI pipelines.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <p
                className="font-mono uppercase mb-3 text-[10px] tracking-widest text-faint"
              >
                {section}
              </p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="transition-colors duration-150 text-muted text-sm hover:text-ink"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-border"
        >
          <p
            className="font-mono text-[11px] text-faint"
          >
            © {new Date().getFullYear()} contextforai · All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
