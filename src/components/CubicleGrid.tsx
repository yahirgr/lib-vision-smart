import { useState } from "react";
import { Cubicle, CubicleStatus } from "@/hooks/useCubicleSimulation";
import { User, Package, Square, Lock, QrCode } from "lucide-react";
import { CubicleDetailDialog } from "./CubicleDetailDialog";
import { CubicleQRDialog } from "./CubicleQRDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDuration } from "@/lib/cubicle-utils";

interface Props {
  cubicles: Cubicle[];
  floorFilter: "lower" | "upper";
  statusFilter: "all" | "free";
  typeFilter: "all" | "standard" | "private";
  onReserve: (id: string) => void;
}

const statusLabels: Record<CubicleStatus, string> = {
  free: "Libre",
  occupied: "Ocupado",
  reserved: "Reservado",
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
  const [qrCubicle, setQrCubicle] = useState<Cubicle | null>(null);

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
      <div
        key={`${floorFilter}-${typeFilter}-${statusFilter}`}
        className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
      >
        {standardCubicles.length > 0 && (
          <div>
            <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3">
              Cubículos Estándar ({standardCubicles.length})
            </h3>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
              {standardCubicles.map((c) => (
                <CubicleButton
                  key={c.id}
                  cubicle={c}
                  onClick={() => setSelected(c)}
                  onQrClick={() => setQrCubicle(c)}
                />
              ))}
            </div>
          </div>
        )}

        {privateCubicles.length > 0 && (
          <div>
            <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" strokeWidth={2} />
              Cubículos Privados ({privateCubicles.length}) · Capacidad: 2 personas
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 gap-3">
              {privateCubicles.map((c) => (
                <CubicleButton
                  key={c.id}
                  cubicle={c}
                  isPrivate
                  onClick={() => setSelected(c)}
                  onQrClick={() => setQrCubicle(c)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <CubicleDetailDialog cubicle={selected} onClose={() => setSelected(null)} onReserve={onReserve} />
      <CubicleQRDialog cubicle={qrCubicle} onClose={() => setQrCubicle(null)} />
    </>
  );
}

function CubicleButton({
  cubicle,
  isPrivate,
  onClick,
  onQrClick,
}: {
  cubicle: Cubicle;
  isPrivate?: boolean;
  onClick: () => void;
  onQrClick: () => void;
}) {
  const Icon = cubicle.status === "occupied" ? User : cubicle.status === "reserved" ? Package : Square;
  const classes = getStatusClasses(cubicle.status);
  const peopleCount = cubicle.personDetected ? 1 : 0;
  const sinceDate = cubicle.status === "occupied" ? cubicle.occupiedSince : cubicle.status === "reserved" ? cubicle.reservedSince : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer
            ${isPrivate ? "glass-cubicle p-4 aspect-[4/3]" : `${classes} p-2.5 aspect-square`}
            ${isPrivate && cubicle.status === "occupied" ? "!bg-primary/20 !border-primary" : ""}
            ${isPrivate && cubicle.status === "reserved" ? "!bg-status-reserved/10 !border-status-reserved" : ""}
            ${isPrivate && cubicle.status === "free" ? "!border-primary/30" : ""}
          `}
        >
          <Icon
            className={`h-4 w-4 mb-0.5 ${cubicle.status === "occupied" ? (isPrivate ? "text-primary" : "text-primary-foreground") : "text-primary"}`}
            strokeWidth={2}
          />
          <span className={`text-[10px] font-semibold ${cubicle.status === "occupied" && !isPrivate ? "text-primary-foreground" : "text-foreground"}`}>
            {cubicle.number}
          </span>

          {cubicle.reservationTimer !== null && cubicle.reservationTimer > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
              {Math.ceil(cubicle.reservationTimer / 60)}m
            </span>
          )}
          {cubicle.status === "reserved" && cubicle.reservationTimer === null && (
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-status-reserved cubicle-pulse" />
          )}

          <span
            role="button"
            tabIndex={0}
            aria-label="Mostrar QR para check-in"
            onClick={(e) => {
              e.stopPropagation();
              onQrClick();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onQrClick();
              }
            }}
            className="absolute bottom-0.5 right-0.5 opacity-50 hover:opacity-100 transition-opacity rounded p-0.5 hover:bg-background/40"
          >
            <QrCode
              className={`h-3 w-3 ${cubicle.status === "occupied" && !isPrivate ? "text-primary-foreground" : "text-foreground"}`}
              strokeWidth={2}
            />
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <div className="space-y-0.5">
          <p className="font-semibold">Cubículo #{cubicle.number} {isPrivate && "· Privado"}</p>
          <p><span className="text-muted-foreground">Estado:</span> {statusLabels[cubicle.status]}</p>
          {sinceDate && (
            <p><span className="text-muted-foreground">Tiempo:</span> {formatDuration(sinceDate)}</p>
          )}
          <p><span className="text-muted-foreground">Personas:</span> {peopleCount}/{cubicle.capacity}</p>
          {cubicle.detectedObjects.length > 0 && (
            <p className="capitalize"><span className="text-muted-foreground">Objetos:</span> {cubicle.detectedObjects.join(", ")}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
