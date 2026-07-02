import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import HeroText from "./components/HeroText";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";
import EndpointsSection from "./components/EndpointsSection";
import QuickstartSection from "./components/QuickstartSection";
import PricingSection from "./components/PricingSection";
import CTASection from "./components/CTASection";
import Navbar from "./components/Navbar";
import StackedSectionsWrapper from "./components/StackedSectionsWrapper";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebAPI",
  name: "contextforai",
  description:
    "One API to extract Markdown, JSON, sitemaps, screenshots, and brand assets from any URL.",
  url: "https://contextforai.ashutoshswamy.in",
  documentation: "https://contextforai.ashutoshswamy.in/docs",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    description: "Free tier with 500 credits/month",
  },
};

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-bg text-ink overflow-x-hidden">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Navbar isLoggedIn={!!userId} />

      <StackedSectionsWrapper>
        {/* Hero */}
        <div className="stacked-panel relative z-[1] bg-bg min-h-screen flex flex-col justify-center shadow-[0_-15px_40px_rgba(0,0,0,0.4)]">
          <section className="relative overflow-hidden w-full h-full flex flex-col justify-center">
            {/* Subtle grid background */}
            <div
              className="absolute inset-0 hero-grid pointer-events-none"
              id="hero-bg"
              style={{ opacity: 0.8 }}
            />
            <div className="relative max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 md:py-24">
              <HeroText isLoggedIn={!!userId} />
            </div>
          </section>
        </div>

        {/* Endpoints */}
        <div className="stacked-panel relative z-[2] bg-bg min-h-screen flex flex-col justify-center shadow-[0_-15px_40px_rgba(0,0,0,0.4)]">
          <EndpointsSection />
        </div>

        {/* How It Works */}
        <div className="stacked-panel relative z-[3] bg-bg min-h-screen flex flex-col justify-center shadow-[0_-15px_40px_rgba(0,0,0,0.4)]">
          <HowItWorks />
        </div>

        {/* Quickstart */}
        <div className="stacked-panel relative z-[4] bg-bg min-h-screen flex flex-col justify-center shadow-[0_-15px_40px_rgba(0,0,0,0.4)]">
          <QuickstartSection />
        </div>

        {/* Pricing */}
        <div className="stacked-panel relative z-[5] bg-bg min-h-screen flex flex-col justify-center shadow-[0_-15px_40px_rgba(0,0,0,0.4)]">
          <PricingSection isLoggedIn={!!userId} />
        </div>

        {/* CTA */}
        <div className="stacked-panel relative z-[6] bg-bg min-h-screen flex flex-col justify-center shadow-[0_-15px_40px_rgba(0,0,0,0.4)]">
          <CTASection isLoggedIn={!!userId} />
        </div>
      </StackedSectionsWrapper>

      <div className="relative z-[7] bg-bg shadow-[0_-20px_40px_rgba(0,0,0,0.8)]">
        <Footer />
      </div>
    </div>
  );
}
