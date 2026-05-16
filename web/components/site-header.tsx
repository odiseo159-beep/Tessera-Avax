"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/utils";
import { useKycStatus } from "@/hooks/use-kyc-status";

interface NavLink {
  href: string;
  label: string;
  matchPrefix?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: "/private", label: "Private", matchPrefix: true },
  { href: "/public", label: "Public", matchPrefix: true },
  { href: "/portfolio", label: "Portfolio" },
];

function KycPill() {
  const { state } = useKycStatus();

  const styles: Record<typeof state, { label: string; className: string }> = {
    disconnected: {
      label: "Sin wallet",
      className: "bg-muted text-muted-foreground",
    },
    unconfigured: {
      label: "KYC sin desplegar",
      className: "bg-muted text-muted-foreground",
    },
    loading: {
      label: "Cargando KYC",
      className: "bg-muted text-muted-foreground",
    },
    pending: {
      label: "KYC pendiente",
      className: "bg-[#FFF3D6] text-[#7A5A00]",
    },
    verified: {
      label: "KYC verificado",
      className: "bg-[#E7F3F0] text-[#0F6E56]",
    },
  };

  const { label, className } = styles[state];

  return (
    <Link
      href="/kyc"
      className={cn(
        "hidden md:inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors hover:opacity-80",
        className
      )}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#3C3489] text-xs font-semibold text-white">
            T
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Tessera
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {NAV_LINKS.map((link) => {
            const active = link.matchPrefix
              ? pathname.startsWith(link.href)
              : pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
                  active && "bg-muted text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <KycPill />
          <ConnectButton
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
            chainStatus="icon"
            showBalance={{ smallScreen: false, largeScreen: true }}
          />
        </div>
      </div>
    </header>
  );
}
