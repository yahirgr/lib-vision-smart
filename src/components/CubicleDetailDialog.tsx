import { Cubicle } from "@/hooks/useCubicleSimulation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Package, User, Eye, Lock, Timer } from "lucide-react";

interface Props {
  cubicle: Cubicle | null;
  onClose: () => void;
  onReserve: (id: string) => void;
}

function formatDuration(from: Date | null): string {
  if (!from) return "—";
  const mins = Math.round((Date.now() - from.getTime()) / 60000);
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

const statusLabels = {
  free: "Libre",
  occupied: "Ocupado",
  reserved: "Reservado",
};

export function CubicleDetailDialog({ cubicle, onClose, onReserve }: Props) {
  if (!cubicle) return null;

  return (
    <Dialog open={!!cubicle} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-3">
            <Eye className="h-5 w-5 text-primary" />
            Cubículo #{cubicle.number}
            {cubicle.type === "private" && (
              <Badge variant="outline" className="text-[10px] gap-1">
                <Lock className="h-2.5 w-2.5" /> Privado
              </Badge>
            )}
            <Badge
              className={`border ${
                cubicle.status === "occupied"
                  ? "bg-primary text-primary-foreground"
                  : cubicle.status === "reserved"
                  ? "bg-status-reserved-bg text-primary border-status-reserved"
                  : "bg-card text-primary border-primary"
              }`}
            >
              {statusLabels[cubicle.status]}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Planta:</span>
            {cubicle.floor === "lower" ? "Baja" : "Alta"}
            <span className="mx-2">·</span>
            <span className="font-medium">Tipo:</span>
            {cubicle.type === "private" ? `Privado (${cubicle.capacity} personas)` : "Estándar"}
          </div>

          {cubicle.reservationTimer !== null && cubicle.reservationTimer > 0 && (
            <div className="flex items-center gap-2 text-sm bg-accent p-2 rounded-md">
              <Timer className="h-4 w-4 text-primary cubicle-pulse" />
              <span>Timer de reserva: <strong>{cubicle.reservationTimer}s</strong> restantes</span>
            </div>
          )}

          {cubicle.status === "occupied" && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-primary" />
              <span>Persona detectada</span>
              <span className="ml-auto text-muted-foreground">
                <Clock className="inline h-3 w-3 mr-1" />
                {formatDuration(cubicle.occupiedSince)}
              </span>
            </div>
          )}

          {cubicle.status === "reserved" && cubicle.detectedObjects.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-status-reserved" />
                <span>Objetos sin persona</span>
                <span className="ml-auto text-muted-foreground">
                  <Clock className="inline h-3 w-3 mr-1" />
                  {formatDuration(cubicle.reservedSince)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cubicle.detectedObjects.map((obj) => (
                  <Badge key={obj} variant="secondary" className="text-xs capitalize">
                    {obj}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {cubicle.status === "free" && (
            <Button
              onClick={() => {
                onReserve(cubicle.id);
                onClose();
              }}
              className="w-full"
            >
              Reservar Cubículo (2 min)
            </Button>
          )}

          <div className="text-xs text-muted-foreground border-t pt-3">
            Última actualización: {cubicle.lastUpdate.toLocaleTimeString("es-MX")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
