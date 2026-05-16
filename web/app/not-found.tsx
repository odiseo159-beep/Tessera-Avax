import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 px-4 pb-16 pt-24 text-center sm:px-6 lg:px-8">
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        404
      </span>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        No encontramos esa página.
      </h1>
      <p className="text-sm text-muted-foreground">
        Quizás el ticker no existe o el enlace está desactualizado. En private
        tenemos KVK, BTS, CLP y ARK1. En public tenemos AAPL, MSFT, NVDA,
        GOOGL, AMZN y META.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/">Ir al inicio</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/private">Private equity</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/public">Public equity</Link>
        </Button>
      </div>
    </main>
  );
}
