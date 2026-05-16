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
        Quizás el ticker no existe o el enlace está desactualizado. Las cuatro
        empresas listadas son KVK, BTS, CLP y ARK1.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/">Ir al marketplace</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/portfolio">Ver mi portfolio</Link>
        </Button>
      </div>
    </main>
  );
}
