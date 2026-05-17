"use client";

import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useKycStatus } from "@/hooks/use-kyc-status";
import { contractAddresses, ZERO_ADDRESS } from "@/lib/contracts";
import { shortAddress } from "@/lib/format";
import { UniverseTransition } from "@/components/landing/universe-transition";

const USDC_UNIT = 1_000_000n;

function formatUsdc(value: bigint | undefined): string {
  if (!value) return "0";
  const dollars = Number(value) / Number(USDC_UNIT);
  return dollars.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

const KYC_LABEL: Record<
  "disconnected" | "unconfigured" | "loading" | "pending" | "verified",
  string
> = {
  disconnected: "Sin wallet",
  unconfigured: "KYC sin desplegar",
  loading: "Cargando KYC",
  pending: "KYC pendiente",
  verified: "KYC verificado",
};

export function TesseraHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [entering, setEntering] = useState<"private" | "public" | null>(null);
  const { address, isConnected } = useAccount();
  const { state: kycState } = useKycStatus();
  const pathname = usePathname();
  const router = useRouter();

  const { data: usdcBalance } = useBalance({
    address,
    token: contractAddresses.usdc !== ZERO_ADDRESS ? contractAddresses.usdc : undefined,
    query: { enabled: isConnected && contractAddresses.usdc !== ZERO_ADDRESS },
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isOn = (prefix: string) =>
    prefix === "/" ? pathname === "/" : pathname.startsWith(prefix);

  // Intercepts a click on Private/Public nav: if we're navigating INTO that
  // universe (not already inside), play the same overlay used by the
  // landing's choose-market cards, then push the route on overlay done.
  const handleUniverseClick =
    (universe: "private" | "public", href: string) =>
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // honor cmd/ctrl/middle-click for "open in new tab"
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      if (pathname === href || pathname.startsWith(`${href}/`)) return;
      e.preventDefault();
      setEntering(universe);
    };

  return (
    <>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="header-inner">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-mark-a" />
              <span className="brand-mark-b" />
            </span>
            <span className="brand-name">Tessera</span>
          </Link>
          <nav className="nav">
            <Link
              className={`nav-link ${isOn("/private") ? "is-current" : ""}`}
              href="/private"
              onClick={handleUniverseClick("private", "/private")}
            >
              <span className="nav-dot nav-dot--private" />
              Private
            </Link>
            <Link
              className={`nav-link ${isOn("/public") ? "is-current" : ""}`}
              href="/public"
              onClick={handleUniverseClick("public", "/public")}
            >
              <span className="nav-dot nav-dot--public" />
              Public
            </Link>
            <Link
              className={`nav-link ${isOn("/portfolio") ? "is-current" : ""}`}
              href="/portfolio"
            >
              Portfolio
            </Link>
            <Link
              className={`nav-link ${isOn("/kyc") ? "is-current" : ""}`}
              href="/kyc"
            >
              KYC
            </Link>
          </nav>
          <div className="header-right">
            <Link
              href="/kyc"
              className={`kyc-pill kyc-pill--${kycState}`}
              data-state={kycState}
            >
              <span className="kyc-dot" />
              {KYC_LABEL[kycState]}
            </Link>

            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
                if (!mounted) {
                  return <span className="wallet-btn" aria-hidden="true" />;
                }
                if (!account || !chain) {
                  return (
                    <button className="wallet-btn wallet-btn--connect" onClick={openConnectModal}>
                      <span className="wallet-addr">Conectar wallet</span>
                    </button>
                  );
                }
                if (chain.unsupported) {
                  return (
                    <button className="wallet-btn wallet-btn--wrong" onClick={openChainModal}>
                      <span className="wallet-addr">Cambiar a Fuji</span>
                    </button>
                  );
                }
                return (
                  <button className="wallet-btn" onClick={openAccountModal}>
                    <span className="wallet-addr">
                      {address ? shortAddress(address) : account.displayName}
                    </span>
                    <span className="wallet-bal">
                      {formatUsdc(usdcBalance?.value)} USDC
                    </span>
                  </button>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </header>

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
