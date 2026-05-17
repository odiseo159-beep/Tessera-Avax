"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import "./landing.css";

import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Hero } from "@/components/landing/hero";
import { TickerTape } from "@/components/landing/ticker-tape";
import { ChooseMarket } from "@/components/landing/choose-market";
import { ProofOfLife } from "@/components/landing/proof-of-life";
import { HowItWorks } from "@/components/landing/how-it-works";
import { UniverseTransition } from "@/components/landing/universe-transition";

export default function LandingPage() {
  const router = useRouter();
  const [entering, setEntering] = useState<"private" | "public" | null>(null);

  return (
    <div className="tessera-landing app bg-warm">
      <div className="grain" aria-hidden="true" />

      <LandingHeader />

      <main>
        <Hero variant="stagger" />
        <TickerTape style="scroll" />
        <ChooseMarket
          tilt
          showConnector
          onEnter={(u) => setEntering(u)}
        />
        <ProofOfLife />
        <HowItWorks />
      </main>

      <LandingFooter />

      <UniverseTransition
        universe={entering}
        onDone={() => {
          if (entering) router.push(`/${entering}`);
          setEntering(null);
        }}
      />
    </div>
  );
}
