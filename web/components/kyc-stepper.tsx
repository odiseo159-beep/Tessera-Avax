"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Check, ChevronLeft, ChevronRight, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useKycStatus } from "@/hooks/use-kyc-status";
import { useMintUsdc } from "@/hooks/use-mint-usdc";
import { shortAddress } from "@/lib/format";

const COUNTRIES = [
  { code: "MX", label: "México" },
  { code: "CO", label: "Colombia" },
  { code: "AR", label: "Argentina" },
  { code: "BR", label: "Brasil" },
  { code: "CL", label: "Chile" },
  { code: "PE", label: "Perú" },
  { code: "UY", label: "Uruguay" },
];

type Step = 1 | 2 | 3 | "success";

interface FormData {
  fullName: string;
  email: string;
  country: string;
  hasDocument: boolean;
}

const STEPS: Array<{ id: 1 | 2 | 3; label: string }> = [
  { id: 1, label: "Datos personales" },
  { id: 2, label: "Documento" },
  { id: 3, label: "Confirmación" },
];

export function KycStepper() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { state: kycState } = useKycStatus();
  const { mint, state: mintState } = useMintUsdc();

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    country: "MX",
    hasDocument: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const onNext = () => {
    setError(null);
    if (step === 1) {
      if (!form.fullName.trim() || !form.email.trim() || !form.country) {
        setError("Completa todos los campos");
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
        setError("Email inválido");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!form.hasDocument) {
        setError("Sube tu documento de identidad");
        return;
      }
      setStep(3);
    }
  };

  const onBack = () => {
    setError(null);
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const onSubmit = async () => {
    if (!address) {
      setError("Conecta tu wallet primero");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/kyc/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet: address, country: form.country }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "La verificación falló");
        setSubmitting(false);
        return;
      }
      setTxHash(data.txHash ?? null);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red");
    } finally {
      setSubmitting(false);
    }
  };

  if (kycState === "verified" && step !== "success") {
    return (
      <div className="rounded-lg border border-border/60 bg-card p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E7F3F0] text-[#0F6E56]">
          <Check className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Tu wallet ya está verificada
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {address && shortAddress(address)} aparece en el IdentityRegistry. Puedes
          empezar a operar.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Ir al marketplace</Link>
        </Button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-border/60 bg-card p-8 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Conecta tu wallet primero
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          La verificación queda atestada on-chain con la address que conectes.
        </p>
        <div className="mt-6 flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="rounded-lg border border-border/60 bg-card p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E7F3F0] text-[#0F6E56]">
          <Check className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Verificación completa
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu wallet quedó atestada en el IdentityRegistry. Reclama USDC mock
          para empezar a operar.
        </p>

        {txHash && (
          <a
            href={`https://testnet.snowtrace.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Ver tx en Snowtrace
          </a>
        )}

        <div className="mt-6 flex flex-col items-stretch gap-2 sm:flex-row sm:justify-center">
          <Button
            onClick={() => mint()}
            disabled={mintState === "minting"}
            className="bg-[#0F6E56] hover:bg-[#0F6E56]/90"
          >
            {mintState === "minting"
              ? "Minteando…"
              : mintState === "success"
                ? "10k USDC enviados"
                : "Reclama 10k USDC mock"}
          </Button>
          <Button asChild variant="outline" onClick={() => router.push("/")}>
            <Link href="/">Ir al marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <ol className="grid grid-cols-3 border-b border-border/60">
        {STEPS.map((s) => {
          const active = s.id === step;
          const done = s.id < (step as number);
          return (
            <li
              key={s.id}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-xs",
                active
                  ? "text-foreground"
                  : done
                    ? "text-[#0F6E56]"
                    : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold",
                  active
                    ? "bg-foreground text-background"
                    : done
                      ? "bg-[#0F6E56] text-white"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="h-3 w-3" /> : s.id}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </li>
          );
        })}
      </ol>

      <div className="space-y-4 p-6">
        {step === 1 && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs text-muted-foreground">
                Nombre completo
              </Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Daniel Pérez"
                autoComplete="name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="daniel@ejemplo.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country" className="text-xs text-muted-foreground">
                País de residencia fiscal
              </Label>
              <Select
                value={form.country}
                onValueChange={(value) => setForm({ ...form, country: value })}
              >
                <SelectTrigger id="country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">
              Documento de identidad
            </Label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center transition-colors hover:border-[#0F6E56]/40 hover:bg-muted/50">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {form.hasDocument
                  ? "Documento cargado"
                  : "Sube tu identificación"}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Mock — el archivo no se procesa ni se sube a ningún lado
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setForm({ ...form, hasDocument: !!e.target.files?.length })}
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <dl className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Wallet</dt>
                  <dd className="font-mono text-foreground">{address && shortAddress(address)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Nombre</dt>
                  <dd className="text-foreground">{form.fullName}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="text-foreground">{form.email}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">País</dt>
                  <dd className="text-foreground">
                    {COUNTRIES.find((c) => c.code === form.country)?.label}
                  </dd>
                </div>
              </dl>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Al confirmar, el claim issuer firma una transacción que registra
              tu wallet en el IdentityRegistry on-chain. El gas lo paga el
              issuer.
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs text-[#C03737]">{error}</p>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={step === 1 || submitting}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Atrás
          </Button>
          {step === 3 ? (
            <Button onClick={onSubmit} disabled={submitting} className="gap-1">
              {submitting ? "Verificando…" : "Confirmar y verificar"}
            </Button>
          ) : (
            <Button onClick={onNext} className="gap-1">
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
