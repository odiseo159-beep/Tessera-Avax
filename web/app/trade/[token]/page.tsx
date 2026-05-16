import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { companyBySlug } from "@/lib/mock-companies";

interface PageProps {
  params: { token: string };
}

export default function TradePage({ params }: PageProps) {
  const company = companyBySlug(params.token);
  if (!company) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-lg text-sm font-semibold"
          style={{ backgroundColor: company.logoBg, color: company.logoColor }}
        >
          {company.symbol}
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {company.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {company.sector} · {company.round} · {company.country}
          </p>
        </div>
        <Badge variant="outline" className="ml-auto">
          {company.symbol}
        </Badge>
      </div>

      <div className="mt-10 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          La vista de trading (orderbook + price chart + trade panel) llega en la
          siguiente fase.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">Volver al marketplace</Link>
        </Button>
      </div>
    </main>
  );
}
