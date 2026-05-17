import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./landing.css";
import "./interior.css";

import { Providers } from "./providers";
import { TesseraHeader } from "@/components/shell/tessera-header";
import { TesseraFooter } from "@/components/shell/tessera-footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Tessera · dual asset secondary market on Avalanche",
  description:
    "Mercado secundario dual sobre Avalanche: equity privado latinoamericano (Tessera) + acciones públicas tokenizadas (Dinari). KYC reusable on-chain.",
  icons: {
    icon: "/brand/tessera.png",
    apple: "/brand/tessera.png",
  },
  openGraph: {
    title: "Tessera",
    description: "Dos universos de activos. Una sola identidad on-chain.",
    images: ["/brand/tessera.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          <div className="tessera-landing app bg-warm">
            <div className="grain" aria-hidden="true" />
            <TesseraHeader />
            <main>{children}</main>
            <TesseraFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
