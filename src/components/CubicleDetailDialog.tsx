import { Cubicle } from "@/hooks/useCubicleSimulation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, User, Eye } from "lucide-react";

interface Props {
  cubicle: Cubicle | null;
  onClose: () => void;
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
  reserved: "Apartado",
};

const statusColors = {
  free: "bg-status-free-bg text-status-free border-status-free",
  occupied: "bg-status-occupied-bg text-status-occupied border-status-occupied",
  reserved: "bg-status-reserved-bg text-status-reserved border-status-reserved",
};

export function CubicleDetailDialog({ cubicle, onClose }: Props) {
  if (!cubicle) return null;

  return (
    <Dialog open={!!cubicle} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-3">
            <Eye className="h-5 w-5 text-primary" />
            Cubículo #{cubicle.id}
            <Badge className={`${statusColors[cubicle.status]} border`}>
              {statusLabels[cubicle.status]}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Planta:</span>
            {cubicle.floor === "lower" ? "Baja" : "Alta"}
          </div>

          {cubicle.status === "occupied" && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-status-occupied" />
              <span>Persona detectada</span>
              <span className="ml-auto text-muted-foreground">
                <Clock className="inline h-3 w-3 mr-1" />
                {formatDuration(cubicle.occupiedSince)}
              </span>
            </div>
          )}

          {cubicle.status === "reserved" && (
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

          <div className="text-xs text-muted-foreground border-t pt-3">
            Última actualización: {cubicle.lastUpdate.toLocaleTimeString("es-MX")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
