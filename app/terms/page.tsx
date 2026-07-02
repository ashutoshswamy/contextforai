import { ArrowLeft } from "lucide-react";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service · contextforai",
  description: "The terms governing use of the contextforai API and dashboard.",
  alternates: { canonical: "/terms" },
};

const EFFECTIVE = "July 1, 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-bg/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-mono text-sm font-semibold text-ink hover:text-ember transition-colors">
            contextforai
          </a>
          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted hover:text-ink">
            <a href="/">
              <ArrowLeft size={15} /> Back to home
            </a>
          </Button>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
          <div className="mb-10">
            <p className="text-xs font-mono text-faint uppercase tracking-widest mb-2">Legal</p>
            <h1 className="text-3xl font-semibold text-ink mb-3">Terms of Service</h1>
            <p className="text-sm text-muted">Effective {EFFECTIVE}</p>
          </div>

          <div>
            <Section title="1. Agreement">
              <p>
                By accessing or using the contextforai API ("Service"), you agree to be bound
                by these Terms. If you are using the Service on behalf of an organization, you
                represent that you have authority to bind that organization. If you do not agree,
                do not use the Service.
              </p>
            </Section>

            <Section title="2. Service description">
              <p>
                contextforai provides an HTTP API that fetches publicly accessible URLs and
                returns structured content: Markdown, JSON metadata, page sitemaps,
                screenshots, and brand assets. The Service is provided on a credit-based model.
                Each request consumes a defined number of credits depending on the endpoint.
              </p>
            </Section>

            <Section title="3. Accounts and API keys">
              <p>
                You must register for an account to use the Service. You are responsible for
                keeping your API keys confidential. Do not embed keys in client-side code or
                public repositories. Any request made with your key is your responsibility,
                regardless of who made it.
              </p>
              <p>
                You may create multiple API keys and revoke them at any time from your dashboard.
                We reserve the right to revoke keys that we determine have been compromised or
                misused.
              </p>
            </Section>

            <Section title="4. Acceptable use">
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>
                  Fetch content you do not have the right to access or process (e.g. pages
                  protected by login, paywalls, or explicit scraping prohibitions in a site's
                  Terms of Service)
                </li>
                <li>
                  Circumvent, bypass, or disable any technical or access controls on third-party
                  websites
                </li>
                <li>
                  Collect personal data about individuals without a lawful basis under applicable
                  data protection law
                </li>
                <li>
                  Attempt denial-of-service attacks, excessive automated scraping at scale, or
                  any action that degrades the availability of target websites or our own
                  infrastructure
                </li>
                <li>
                  Distribute, resell, or sublicense API access to third parties without express
                  written permission
                </li>
                <li>Violate any applicable local, national, or international law or regulation</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that we determine, in our
                sole discretion, are in violation of these terms or are creating risk for us,
                our infrastructure, or third parties.
              </p>
            </Section>

            <Section title="5. Credits, billing, and refunds">
              <p>
                Credits are purchased in advance and consumed per request. Credit amounts per
                endpoint are displayed in the dashboard and on the pricing page and may change
                with reasonable notice.
              </p>
              <p>
                Credits are <strong>non-refundable</strong> once consumed. Unused credits from
                one-time top-ups expire 30 days after purchase and do not roll over past that
                window. This includes the free plan: its monthly allowance is granted on a rolling
                30-day cycle and does not roll over between cycles, the same as any paid plan.
                Yearly plans are billed once for 12 months of credits upfront, at a 20% discount
                off the monthly price, and do not reset again until the year is up.
              </p>
              <p>
                Each API key is subject to a rate limit (requests per minute) that scales with
                your plan; heavier endpoints (screenshots, branding extraction) are limited more
                strictly. Current limits are published in the{" "}
                <a href="/docs#rate-limits">API documentation</a> and may change with reasonable
                notice.
              </p>
              <p>
                Payments are processed by Razorpay. By purchasing credits, you agree to
                Razorpay's terms. Disputed charges should be raised with us at{" "}
                <a href="mailto:ashutoshswamy397@gmail.com">ashutoshswamy397@gmail.com</a> before
                initiating a chargeback. Chargebacks without prior contact may result in account
                suspension.
              </p>
            </Section>

            <Section title="6. Intellectual property">
              <p>
                We do not claim ownership of the content extracted from third-party URLs you
                submit. You are responsible for ensuring you have rights to process and use that
                content under applicable law.
              </p>
              <p>
                The Service itself, including its API design, documentation, and infrastructure,
                is owned by contextforai. You may not reverse-engineer, copy, or create
                derivative works of the Service.
              </p>
            </Section>

            <Section title="7. Data and privacy">
              <p>
                Use of the Service is subject to our{" "}
                <a href="/privacy">Privacy Policy</a>, which is incorporated into these Terms by
                reference. By using the Service, you consent to the data practices described
                there.
              </p>
            </Section>

            <Section title="8. Disclaimer of warranties">
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY
                KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                PARTICULAR PURPOSE, OR NON-INFRINGEMENT. We do not warrant that the Service will
                be uninterrupted, error-free, or that extraction results will be complete or
                accurate. Web content changes; we make no guarantee about the freshness or
                fidelity of extracted data.
              </p>
            </Section>

            <Section title="9. Limitation of liability">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, contextforai's total liability for any
                claim arising from these Terms or the Service is limited to the amount you paid
                us in the 30 days preceding the event giving rise to the claim. WE ARE NOT LIABLE
                FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, EVEN IF
                ADVISED OF THEIR POSSIBILITY.
              </p>
            </Section>

            <Section title="10. Indemnification">
              <p>
                You agree to indemnify and hold harmless contextforai and its officers,
                employees, and agents from any claims, damages, or expenses (including reasonable
                legal fees) arising from: (a) your use of the Service; (b) your violation of
                these Terms; or (c) your violation of any third-party right, including
                intellectual property or privacy rights.
              </p>
            </Section>

            <Section title="11. Termination">
              <p>
                You may close your account at any time from the dashboard. We may suspend or
                terminate your access for violation of these Terms, extended non-payment, or
                any reason with reasonable notice. Termination does not entitle you to a refund
                of unused credits except where required by applicable consumer protection law.
              </p>
            </Section>

            <Section title="12. Changes to these Terms">
              <p>
                We may update these Terms. We will notify you of material changes by email at
                least 14 days in advance. Continued use after the effective date constitutes
                acceptance of the revised Terms.
              </p>
            </Section>

            <Section title="13. Governing law">
              <p>
                These Terms are governed by the laws of India. Any disputes shall be subject to
                the exclusive jurisdiction of the courts of India, without regard to conflict-of-law
                principles.
              </p>
            </Section>

            <Section title="14. Contact">
              <p>
                Questions about these Terms:{" "}
                <a href="mailto:ashutoshswamy397@gmail.com">ashutoshswamy397@gmail.com</a>
              </p>
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-ink mb-3 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="text-sm text-muted leading-7 space-y-3 [&_a]:text-ember [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-ember-hi [&_strong]:text-ink [&_strong]:font-medium [&_ul]:pl-4 [&_ul]:space-y-1.5 [&_ul>li]:list-disc [&_ul>li]:marker:text-faint">
        {children}
      </div>
    </section>
  );
}
