import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { PasswordGate } from "@/components/layout/PasswordGate";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
};

export const metadata: Metadata = {
  title: "World Cup Predictor | FIFA 2026",
  description:
    "Acompanhe a Copa do Mundo FIFA 2026 e obtenha palpites de partidas com Inteligência Artificial",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WC 2026",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "World Cup Predictor | FIFA 2026",
    description: "Palpites com IA para a Copa do Mundo 2026",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body
        className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white min-h-screen transition-colors`}
      >
        <PasswordGate>
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        </PasswordGate>
      </body>
    </html>
  );
}
