import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Trophy } from "lucide-react";

export function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Trophy className="w-7 h-7 text-yellow-400" />
          <div>
            <h1 className="font-black text-lg leading-tight">World Cup Predictor</h1>
            <p className="text-xs text-blue-200 leading-tight">FIFA World Cup 2026</p>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-yellow-300 transition-colors">
            Início
          </Link>
          <Link href="/groups" className="hover:text-yellow-300 transition-colors">
            Grupos
          </Link>
          <Link href="/knockout" className="hover:text-yellow-300 transition-colors">
            Mata-Mata
          </Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
