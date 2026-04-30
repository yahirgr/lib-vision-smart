import { ActivityLog, Cubicle } from "@/hooks/useCubicleSimulation";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Activity, AlertTriangle, Info, Zap, Cpu, Eye } from "lucide-react";
import { SimulationPanel } from "./SimulationPanel";
import { CriticalAlertsPanel } from "./CriticalAlertsPanel";

interface Props {
  logs: ActivityLog[];
  cubicles: Cubicle[];
  criticalAlerts: ActivityLog[];
  yoloStatus: { fps: number; confidence: number; active: boolean };
  threshold: number;
  onThresholdChange: (val: number) => void;
  onSimulate: (cubicleId: string, mode: "person" | "objects" | "empty" | "overcapacity") => void;
}

const logIcons = {
  info: <Info className="h-3.5 w-3.5 text-primary" />,
  warning: <AlertTriangle className="h-3.5 w-3.5 text-status-reserved" />,
  alert: <Zap className="h-3.5 w-3.5 text-primary" />,
};

export function AdminPanel({ logs, cubicles, criticalAlerts, yoloStatus, threshold, onThresholdChange, onSimulate }: Props) {
  return (
    <div className="space-y-6">
      <CriticalAlertsPanel alerts={criticalAlerts} />

      {/* YOLO Status */}
      <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="font-display font-semibold text-sm flex items-center gap-2 mb-3">
          <Cpu className="h-4 w-4 text-primary" />
          Estado del Modelo YOLO
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className={`h-2 w-2 rounded-full ${yoloStatus.active ? "bg-primary cubicle-pulse" : "bg-destructive"}`} />
              <span className="text-xs text-muted-foreground">Estado</span>
            </div>
            <p className="text-sm font-semibold">{yoloStatus.active ? "Activo" : "Inactivo"}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">FPS</span>
            </div>
            <p className="text-sm font-semibold">{yoloStatus.fps.toFixed(1)}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Confianza</span>
            </div>
            <p className="text-sm font-semibold">{(yoloStatus.confidence * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Simulation Panel */}
      <SimulationPanel cubicles={cubicles} onSimulate={onSimulate} />

      {/* Threshold Config */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-display font-semibold text-sm mb-3">⏱ Umbral de liberación automática</h3>
        <div className="flex items-center gap-4">
          <Slider
            value={[threshold]}
            onValueChange={(v) => onThresholdChange(v[0])}
            min={1}
            max={10}
            step={1}
            className="flex-1"
          />
          <span className="text-sm font-semibold min-w-[4rem] text-right">{threshold} min</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Cubículos apartados se liberan automáticamente tras {threshold} minutos sin actividad.
        </p>
      </div>

      {/* Activity Logs */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-display font-semibold text-sm flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-primary" />
          Registro de Actividad
        </h3>
        <ScrollArea className="h-[300px]">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Sin actividad registrada aún...</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-xs border-b pb-2 last:border-0">
                  {logIcons[log.type]}
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground">{log.message}</p>
                    <p className="text-muted-foreground mt-0.5">{log.timestamp.toLocaleTimeString("es-MX")}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {log.cubicleId}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
