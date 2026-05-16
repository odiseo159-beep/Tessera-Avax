import { KycStepper } from "@/components/kyc-stepper";

export default function KycPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 border-b border-border/60 pb-6">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          KYC reusable
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Verifica tu identidad una vez. Inviértela en cualquier empresa
          listada.
        </h1>
        <p className="text-sm text-muted-foreground">
          Tu verificación queda atestada on-chain en el IdentityRegistry. Cada
          transferencia de SecurityToken consulta tu address contra ese
          registry — sin verificación, no puedes recibir ni vender tokens.
        </p>
      </div>

      <div className="mt-8">
        <KycStepper />
      </div>
    </main>
  );
}
