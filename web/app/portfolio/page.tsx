import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PortfolioPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 border-b border-border/60 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Portfolio
        </h1>
        <p className="text-sm text-muted-foreground">
          Tus holdings, órdenes activas y trades históricos.
        </p>
      </div>

      <div className="mt-10 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          La vista de portfolio se conecta cuando los contratos estén
          desplegados y empieces a operar.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">Ir al marketplace</Link>
        </Button>
      </div>
    </main>
  );
}
