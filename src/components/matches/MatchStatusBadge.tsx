import { MatchStatus } from "@/types";
import { cn } from "@/lib/utils";

const labels: Record<MatchStatus, string> = {
  live:      "Ao Vivo",
  finished:  "Encerrado",
  scheduled: "Agendado",
};

const styles: Record<MatchStatus, string> = {
  live:      "bg-green-500 text-white",
  finished:  "bg-gray-500 text-white",
  scheduled: "bg-blue-600 text-white",
};

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center", styles[status])}>
      {status === "live" && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1 animate-pulse" />
      )}
      {labels[status]}
    </span>
  );
}
