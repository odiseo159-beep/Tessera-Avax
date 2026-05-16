import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function KycPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 border-b border-border/60 pb-6">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          KYC reusable
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Verifica tu identidad una vez. Inviértela en cualquier empresa
          listada.
        </h1>
        <p className="text-sm text-muted-foreground">
          Tu verificación queda atestada on-chain en el IdentityRegistry. Las
          transferencias de SecurityToken validan tu address contra ese
          registry en cada operación.
        </p>
      </div>

      <div className="mt-10 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          El flujo de KYC en 3 pasos se construye en la siguiente fase.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">Volver al marketplace</Link>
        </Button>
      </div>
    </main>
  );
}
