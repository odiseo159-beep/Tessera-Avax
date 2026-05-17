import { notFound } from "next/navigation";
import { TradePage } from "@/components/interior/trade-page";
import { companyBySlug } from "@/lib/mock-companies";

interface PageProps {
  params: { token: string };
}

export default function PrivateTradePage({ params }: PageProps) {
  const company = companyBySlug(params.token);
  if (!company || company.universe !== "private") notFound();
  return <TradePage company={company} />;
}
