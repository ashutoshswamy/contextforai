import { ArrowLeft } from "lucide-react";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy · contextforai",
  description: "How contextforai collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },
};

const EFFECTIVE = "July 1, 2026";

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-semibold text-ink mb-3">Privacy Policy</h1>
            <p className="text-sm text-muted">Effective {EFFECTIVE}</p>
          </div>

          <div className="prose-legal">
            <Section title="1. Who we are">
              <p>
                contextforai is a web content extraction API operated as an independent service.
                We extract and structure publicly accessible web content on behalf of developers
                building AI applications, content pipelines, and automation tools. References to
                "we," "us," or "our" mean contextforai. References to "you" mean any user of
                the service. Use of the Service is also governed by our{" "}
                <a href="/terms">Terms of Service</a>, which together with this policy form the
                full agreement between you and contextforai.
              </p>
            </Section>

            <Section title="2. Information we collect">
              <h3>Account information</h3>
              <p>
                When you sign up, we collect your email address and name via Clerk (our
                authentication provider). Clerk may also collect data it requires to operate
                authentication on our behalf — see{" "}
                <a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener noreferrer">
                  Clerk's Privacy Policy
                </a>
                .
              </p>
              <h3>API usage logs</h3>
              <p>
                Each API request you make is logged. A usage record contains: the endpoint called
                (e.g. <code>/v1/markdown</code>), the URL you submitted, HTTP status code, latency,
                credits consumed, timestamp, and which API key was used. We do <strong>not</strong>{" "}
                log the full extracted content of pages you process.
              </p>
              <h3>Payment data</h3>
              <p>
                Payments are handled by Razorpay. We store the product ID, credit amount, order
                amount, and payment status. We do <strong>not</strong> store card numbers or bank
                details — these remain with Razorpay.
              </p>
              <h3>Technical data</h3>
              <p>
                Standard server logs may include IP addresses and browser user agents for security
                and abuse prevention. These are not linked to your account for marketing purposes.
              </p>
            </Section>

            <Section title="3. How we use your data">
              <ul>
                <li>Deliver the API service and track credit consumption</li>
                <li>Process payments and maintain billing records</li>
                <li>Authenticate your account and secure API key access</li>
                <li>Investigate abuse, enforce rate limits, and maintain service integrity</li>
                <li>Respond to support requests</li>
                <li>Improve reliability and performance of our extraction pipelines</li>
              </ul>
              <p>
                We do not sell your data. We do not use your submitted URLs or extracted content
                to train machine learning models.
              </p>
            </Section>

            <Section title="4. Third-party services">
              <p>
                We rely on the following third parties to operate the service. Each has its own
                privacy practices:
              </p>
              <ul>
                <li>
                  <strong>Clerk</strong> — user authentication and session management
                </li>
                <li>
                  <strong>Neon</strong> — PostgreSQL database hosting (AWS infrastructure,
                  ap-southeast-1 region)
                </li>
                <li>
                  <strong>Razorpay</strong> — payment processing
                </li>
              </ul>
              <p>
                We share only the minimum data each provider needs to function. We do not share
                your data with advertisers or data brokers.
              </p>
            </Section>

            <Section title="5. Data retention">
              <p>
                Usage logs are retained for <strong>90 days</strong>, after which they are
                automatically deleted. Account data is retained for the lifetime of your account.
                Payment records are retained for 7 years as required for financial compliance.
                You may request earlier deletion of account and usage data at any time.
              </p>
            </Section>

            <Section title="6. Your rights">
              <p>
                Depending on your jurisdiction, you may have the right to access, correct, export,
                or delete your personal data. To exercise any of these rights, email us at{" "}
                <a href="mailto:ashutoshswamy397@gmail.com">ashutoshswamy397@gmail.com</a>. We will respond
                within 30 days. We may need to verify your identity before acting on a request.
              </p>
            </Section>

            <Section title="7. Cookies">
              <p>
                We use session cookies strictly necessary for authentication (managed by Clerk).
                We do not use advertising cookies or third-party tracking pixels.
              </p>
            </Section>

            <Section title="8. Security">
              <p>
                All data in transit is encrypted via TLS. API keys are stored as hashed prefixes
                — we cannot recover a key once issued. Access to production databases is
                restricted to authorized personnel. We follow security best practices but cannot
                guarantee absolute security.
              </p>
            </Section>

            <Section title="9. Children">
              <p>
                The service is not directed at persons under 16. We do not knowingly collect
                data from minors. If you believe a minor has registered, contact us and we will
                delete the account.
              </p>
            </Section>

            <Section title="10. Changes to this policy">
              <p>
                We may update this policy. If changes are material, we will notify registered
                users by email at least 14 days before the change takes effect. Continued use
                after the effective date constitutes acceptance.
              </p>
            </Section>

            <Section title="11. Contact">
              <p>
                Questions about this policy:{" "}
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
      <div className="text-sm text-muted leading-7 space-y-3 [&_h3]:text-ink [&_h3]:font-medium [&_h3]:mt-5 [&_h3]:mb-1.5 [&_a]:text-ember [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-ember-hi [&_code]:font-mono [&_code]:text-xs [&_code]:bg-raised [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_strong]:text-ink [&_strong]:font-medium [&_ul]:pl-4 [&_ul]:space-y-1.5 [&_ul>li]:list-disc [&_ul>li]:marker:text-faint">
        {children}
      </div>
    </section>
  );
}
