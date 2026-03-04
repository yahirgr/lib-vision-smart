import { useState } from "react";
import { Cubicle, CubicleStatus } from "@/hooks/useCubicleSimulation";
import { User, Package, Minus } from "lucide-react";
import { CubicleDetailDialog } from "./CubicleDetailDialog";

interface Props {
  cubicles: Cubicle[];
  floorFilter: "all" | "lower" | "upper";
  statusFilter: "all" | "free";
}

const statusConfig: Record<CubicleStatus, { bg: string; border: string; icon: typeof User; label: string }> = {
  free: { bg: "bg-status-free-bg", border: "border-status-free", icon: Minus, label: "Libre" },
  occupied: { bg: "bg-status-occupied-bg", border: "border-status-occupied", icon: User, label: "Ocupado" },
  reserved: { bg: "bg-status-reserved-bg", border: "border-status-reserved", icon: Package, label: "Apartado" },
};

export function CubicleGrid({ cubicles, floorFilter, statusFilter }: Props) {
  const [selected, setSelected] = useState<Cubicle | null>(null);

  const filtered = cubicles.filter((c) => {
    if (floorFilter !== "all" && c.floor !== floorFilter) return false;
    if (statusFilter === "free" && c.status !== "free") return false;
    return true;
  });

  return (
    <>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {filtered.map((c) => {
          const cfg = statusConfig[c.status];
          const Icon = cfg.icon;
          return (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 ${cfg.bg} ${cfg.border} transition-all hover:scale-105 hover:shadow-md cursor-pointer aspect-square`}
            >
              <Icon className="h-5 w-5 mb-1" style={{ color: `hsl(var(--status-${c.status === "reserved" ? "reserved" : c.status}))` }} />
              <span className="text-xs font-semibold text-foreground">{c.id}</span>
              {c.status === "reserved" && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-reserved cubicle-pulse" />
              )}
            </button>
          );
        })}
      </div>
      <CubicleDetailDialog cubicle={selected} onClose={() => setSelected(null)} />
    </>
  );
}
