import { useState } from "react";
import { Cubicle, CubicleStatus } from "@/hooks/useCubicleSimulation";
import { User, Package, Minus, Lock } from "lucide-react";
import { CubicleDetailDialog } from "./CubicleDetailDialog";

interface Props {
  cubicles: Cubicle[];
  floorFilter: "lower" | "upper";
  statusFilter: "all" | "free";
  typeFilter: "all" | "standard" | "private";
  onReserve: (id: string) => void;
}

const statusConfig: Record<CubicleStatus, { label: string }> = {
  free: { label: "Libre" },
  occupied: { label: "Ocupado" },
  reserved: { label: "Reservado" },
};

function getStatusClasses(status: CubicleStatus): string {
  switch (status) {
    case "occupied":
      return "bg-primary text-primary-foreground border-primary";
    case "reserved":
      return "bg-status-reserved-bg text-primary border-status-reserved";
    case "free":
    default:
      return "bg-card text-foreground border-primary/40 hover:border-primary";
  }
}

export function CubicleGrid({ cubicles, floorFilter, statusFilter, typeFilter, onReserve }: Props) {
  const [selected, setSelected] = useState<Cubicle | null>(null);

  const filtered = cubicles.filter((c) => {
    if (c.floor !== floorFilter) return false;
    if (statusFilter === "free" && c.status !== "free") return false;
    if (typeFilter !== "all" && c.type !== typeFilter) return false;
    return true;
  });

  const standardCubicles = filtered.filter((c) => c.type === "standard");
  const privateCubicles = filtered.filter((c) => c.type === "private");

  return (
    <>
      {/* Standard cubicles */}
      {standardCubicles.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3">
            Cubículos Estándar ({standardCubicles.length})
          </h3>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
            {standardCubicles.map((c) => (
              <CubicleButton key={c.id} cubicle={c} onClick={() => setSelected(c)} />
            ))}
          </div>
        </div>
      )}

      {/* Private cubicles */}
      {privateCubicles.length > 0 && (
        <div className="mt-6">
          <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Cubículos Privados ({privateCubicles.length}) · Capacidad: 2 personas
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 gap-3">
            {privateCubicles.map((c) => (
              <CubicleButton key={c.id} cubicle={c} isPrivate onClick={() => setSelected(c)} />
            ))}
          </div>
        </div>
      )}

      <CubicleDetailDialog cubicle={selected} onClose={() => setSelected(null)} onReserve={onReserve} />
    </>
  );
}

function CubicleButton({ cubicle, isPrivate, onClick }: { cubicle: Cubicle; isPrivate?: boolean; onClick: () => void }) {
  const Icon = cubicle.status === "occupied" ? User : cubicle.status === "reserved" ? Package : Minus;
  const classes = getStatusClasses(cubicle.status);

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center rounded-lg border-2 transition-all hover:scale-105 hover:shadow-md cursor-pointer
        ${isPrivate ? "glass-cubicle p-4 aspect-[4/3]" : `${classes} p-2.5 aspect-square`}
        ${isPrivate && cubicle.status === "occupied" ? "!bg-primary/20 !border-primary" : ""}
        ${isPrivate && cubicle.status === "reserved" ? "!bg-status-reserved/10 !border-status-reserved" : ""}
        ${isPrivate && cubicle.status === "free" ? "!border-primary/30" : ""}
      `}
    >
      <Icon className={`h-4 w-4 mb-0.5 ${cubicle.status === "occupied" ? (isPrivate ? "text-primary" : "text-primary-foreground") : "text-primary"}`} />
      <span className={`text-[10px] font-semibold ${cubicle.status === "occupied" && !isPrivate ? "text-primary-foreground" : "text-foreground"}`}>
        {cubicle.number}
      </span>
      {cubicle.reservationTimer !== null && cubicle.reservationTimer > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {Math.ceil(cubicle.reservationTimer / 60)}m
        </span>
      )}
      {cubicle.status === "reserved" && cubicle.reservationTimer === null && (
        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-status-reserved cubicle-pulse" />
      )}
    </button>
  );
}
