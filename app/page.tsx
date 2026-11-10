import type { Metadata } from "next";
import HeroText from "./components/HeroText";
import Footer from "./components/Footer";
import EndpointsSection from "./components/EndpointsSection";
import QuickstartSection from "./components/QuickstartSection";
import PricingSection from "./components/PricingSection";
import CTASection from "./components/CTASection";
import Navbar from "./components/Navbar";
import { pageMeta } from "@/lib/seo";
import LandingMotion from "./components/landing/LandingMotion";

export const metadata: Metadata = pageMeta({
  title: "contextforai | URL to Markdown, JSON & Screenshot API",
  description: "Extract clean Markdown, JSON, sitemaps, screenshots, fonts and brand assets from any URL with one API. 500 free credits, no card required.",
  path: "/",
});

const SITE = "https://contextforai.ashutoshswamy.in";
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE}/#org`, name: "contextforai", url: SITE, logo: `${SITE}/android-chrome-512x512.png` },
    { "@type": "WebSite", "@id": `${SITE}/#website`, name: "contextforai", url: SITE, publisher: { "@id": `${SITE}/#org` } },
    {
      "@type": "WebAPI",
      name: "contextforai",
      description: "One API to extract Markdown, JSON, sitemaps, screenshots, fonts and brand assets from any URL.",
      url: SITE,
      documentation: `${SITE}/docs`,
      provider: { "@id": `${SITE}/#org` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR", description: "Free tier with 500 credits/month" },
    },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <LandingMotion>
      <Navbar />
      <main>
        <HeroText />
        <EndpointsSection />
        <QuickstartSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
      </LandingMotion>
    </div>
  );
}
