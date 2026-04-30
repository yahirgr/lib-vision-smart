import { useState } from "react";
import { useCubicleSimulation } from "@/hooks/useCubicleSimulation";
import { CubicleGrid } from "@/components/CubicleGrid";
import { StatsBar } from "@/components/StatsBar";
import { AdminPanel } from "@/components/AdminPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, Shield, SlidersHorizontal, Building2, Layers, Lock } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LiveClock } from "@/components/LiveClock";

const Index = () => {
  const [threshold, setThreshold] = useState(2);
  const { cubicles, logs, stats, yoloStatus, reserveCubicle, simulateDetection, checkInCubicle, criticalAlerts } = useCubicleSimulation(threshold);
  const [floorFilter, setFloorFilter] = useState<"lower" | "upper">("lower");
  const [statusFilter, setStatusFilter] = useState<"all" | "free">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "standard" | "private">("all");

  const floorCubicles = cubicles.filter((c) => c.floor === floorFilter);
  const floorStats = {
    total: floorCubicles.length,
    free: floorCubicles.filter((c) => c.status === "free").length,
    occupied: floorCubicles.filter((c) => c.status === "occupied").length,
    reserved: floorCubicles.filter((c) => c.status === "reserved").length,
    occupancyPercent: Math.round(
      (floorCubicles.filter((c) => c.status !== "free").length / floorCubicles.length) * 100
    ),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Eye className="h-4 w-4 text-primary-foreground" strokeWidth={2} />
            </div>
            <h1 className="font-display text-lg font-bold tracking-tight">Lib-Vision AI</h1>
            <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">v2.0</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary cubicle-pulse" />
              <span>{cubicles.length} cubículos</span>
            </div>
            <LiveClock />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        <StatsBar stats={stats} />

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="student" className="gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Mapa de Cubículos
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Administración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-4 mt-4">
            {/* Floor Tabs */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <Button
                  size="sm"
                  variant={floorFilter === "lower" ? "default" : "ghost"}
                  onClick={() => setFloorFilter("lower")}
                  className="text-xs h-8"
                >
                  Planta Baja (111)
                </Button>
                <Button
                  size="sm"
                  variant={floorFilter === "upper" ? "default" : "ghost"}
                  onClick={() => setFloorFilter("upper")}
                  className="text-xs h-8"
                >
                  Planta Alta (45)
                </Button>
              </div>

              <span className="text-border">|</span>

              <div className="flex gap-1">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground mt-1" />
                {(["all", "free"] as const).map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={statusFilter === f ? "default" : "outline"}
                    onClick={() => setStatusFilter(f)}
                    className="text-xs h-7"
                  >
                    {f === "all" ? "Todos" : "Disponibles"}
                  </Button>
                ))}
              </div>

              <span className="text-border">|</span>

              <div className="flex gap-1">
                {(["all", "standard", "private"] as const).map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={typeFilter === f ? "default" : "outline"}
                    onClick={() => setTypeFilter(f)}
                    className="text-xs h-7 gap-1"
                  >
                    {f === "private" && <Lock className="h-3 w-3" />}
                    {f === "all" ? "Todos" : f === "standard" ? "Estándar" : "Privados"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm border-2 border-primary/40 bg-card" /> Libre
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-primary" /> Ocupado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm border-2 border-status-reserved bg-status-reserved-bg" /> Reservado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm glass-cubicle" /> Privado
              </span>
            </div>

            {/* Floor stats */}
            <div className="text-xs text-muted-foreground bg-accent/50 rounded-md p-2 flex gap-4">
              <span><strong>{floorStats.free}</strong> libres</span>
              <span><strong>{floorStats.occupied}</strong> ocupados</span>
              <span><strong>{floorStats.reserved}</strong> reservados</span>
              <span><strong>{floorStats.occupancyPercent}%</strong> ocupación</span>
            </div>

            <CubicleGrid
              cubicles={cubicles}
              floorFilter={floorFilter}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              onReserve={reserveCubicle}
              onCheckIn={checkInCubicle}
            />

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <Layers className="h-3.5 w-3.5" />
              {floorFilter === "lower" ? "Planta Baja" : "Planta Alta"}: {floorCubicles.length} cubículos
            </div>
          </TabsContent>

          <TabsContent value="admin" className="mt-4">
            <AdminPanel
              logs={logs}
              cubicles={cubicles}
              criticalAlerts={criticalAlerts}
              yoloStatus={yoloStatus}
              threshold={threshold}
              onThresholdChange={setThreshold}
              onSimulate={simulateDetection}
            />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-4">
        <div className="container text-center text-xs text-muted-foreground">
          Lib-Vision AI · Gestión inteligente de espacios de biblioteca · Reconocimiento autónomo de patrones
        </div>
      </footer>
    </div>
  );
};

export default Index;
