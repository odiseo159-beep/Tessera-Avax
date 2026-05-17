"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <>
      <Hero variant="stagger" />
      <TickerTape style="scroll" />
      <ChooseMarket tilt showConnector onEnter={(u) => setEntering(u)} />
      <ProofOfLife />
      <HowItWorks />

      <UniverseTransition
        universe={entering}
        onDone={() => {
          if (entering) router.push(`/${entering}`);
          setEntering(null);
        }}
      />
    </>
  );
}
