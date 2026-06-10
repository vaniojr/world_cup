"use client";
import { useState, useEffect, useRef } from "react";
import { Trophy, Lock, Eye, EyeOff } from "lucide-react";

const SESSION_KEY = "wcp_auth";
const CORRECT_HASH = "9b3e2f7a1d4c6e8b5a0f2d9c3e7b1a4f"; // obscure storage key

// Simple obfuscation — not real security, just a personal gate
function checkPassword(input: string): boolean {
  return input === atob("SnIyMDI2");
}

interface PasswordGateProps {
  children: React.ReactNode;
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored === CORRECT_HASH) setAuthenticated(true);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !authenticated) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [ready, authenticated]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (checkPassword(password)) {
      sessionStorage.setItem(SESSION_KEY, CORRECT_HASH);
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setPassword("");
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
    }
  }

  if (!ready) return null;
  if (authenticated) return <>{children}</>;

  return (
    <>
      {/* Blurred background */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <div className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm" />
      </div>

      {/* Gate overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${
            shake ? "animate-[wiggle_0.4s_ease-in-out]" : ""
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 py-8 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <span className="font-black text-xl">World Cup Predictor</span>
            </div>
            <p className="text-blue-200 text-sm">FIFA World Cup 2026™</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Acesso restrito. Digite a senha para continuar.
              </p>
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false); }}
                placeholder="Senha de acesso"
                className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-colors
                  bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                  ${error
                    ? "border-red-400 dark:border-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-500 dark:text-red-400 text-center">
                Senha incorreta. Tente novamente.
              </p>
            )}

            <button
              type="submit"
              disabled={!password}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
      `}</style>
    </>
  );
}
