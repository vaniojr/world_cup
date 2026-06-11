import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { MatchStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Date key (YYYY-MM-DD) in the viewer's local timezone — keeps grouping/filtering
// consistent with the local times shown by formatDate (the source dates are UTC).
export function getLocalDateKey(dateString: string): string {
  const date = new Date(dateString);
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day   = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getStatusLabel(status: MatchStatus): string {
  switch (status) {
    case "live":      return "Ao Vivo";
    case "finished":  return "Encerrado";
    case "scheduled": return "Agendado";
  }
}

export function getStatusColor(status: MatchStatus): string {
  switch (status) {
    case "live":      return "bg-green-500 text-white animate-pulse";
    case "finished":  return "bg-gray-500 text-white";
    case "scheduled": return "bg-blue-500 text-white";
  }
}
