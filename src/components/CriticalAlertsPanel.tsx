import { useState } from "react";
import { ActivityLog } from "@/hooks/useCubicleSimulation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangle, ChevronDown, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  alerts: ActivityLog[];
}

export function CriticalAlertsPanel({ alerts }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className={`rounded-xl border-2 ${alerts.length > 0 ? "border-destructive/40 bg-destructive/5" : "border-border bg-card"} shadow-sm transition-all duration-300`}>
        <CollapsibleTrigger className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            {alerts.length > 0 ? (
              <AlertTriangle className="h-4 w-4 text-destructive" strokeWidth={2} />
            ) : (
              <Bell className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
            )}
            <h3 className="font-display font-semibold text-sm">Alertas Críticas</h3>
            {alerts.length > 0 && (
              <Badge variant="destructive" className="text-[10px] h-5">{alerts.length}</Badge>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2} />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4">
          {alerts.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin alertas activas. La IA monitorea continuamente la capacidad.</p>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-start gap-2 text-xs bg-background rounded-lg p-2.5 border border-destructive/20">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium">{a.message}</p>
                    <p className="text-muted-foreground mt-0.5">{a.timestamp.toLocaleTimeString("es-MX")}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{a.cubicleId}</Badge>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
