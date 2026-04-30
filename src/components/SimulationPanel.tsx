import { useState } from "react";
import { Cubicle } from "@/hooks/useCubicleSimulation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Package, XCircle, Zap, AlertTriangle } from "lucide-react";

interface Props {
  cubicles: Cubicle[];
  onSimulate: (cubicleId: string, mode: "person" | "objects" | "empty" | "overcapacity") => void;
}

export function SimulationPanel({ cubicles, onSimulate }: Props) {
  const [selectedId, setSelectedId] = useState<string>("");

  const nonFreeCubicles = cubicles.filter((c) => c.status !== "free").slice(0, 50);
  const allCubicles = cubicles.slice(0, 50);

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-300">
      <h3 className="font-display font-semibold text-sm flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-primary" />
        Panel de Simulación Manual
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Simula detecciones del sensor para probar las reglas de tiempo (2 min).
      </p>

      <div className="space-y-3">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cubículo..." />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {allCubicles.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                #{c.number} — {c.status === "free" ? "Libre" : c.status === "occupied" ? "Ocupado" : "Reservado"} ({c.type === "private" ? "Privado" : "Estándar"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedId && (
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" onClick={() => onSimulate(selectedId, "person")} className="gap-1 text-xs">
              <User className="h-3 w-3" strokeWidth={2} />
              Persona
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onSimulate(selectedId, "objects")} className="gap-1 text-xs">
              <Package className="h-3 w-3" strokeWidth={2} />
              Objetos
            </Button>
            <Button size="sm" variant="outline" onClick={() => onSimulate(selectedId, "empty")} className="gap-1 text-xs">
              <XCircle className="h-3 w-3" strokeWidth={2} />
              Vacío
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onSimulate(selectedId, "overcapacity")} className="gap-1 text-xs">
              <AlertTriangle className="h-3 w-3" strokeWidth={2} />
              Exceso
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
