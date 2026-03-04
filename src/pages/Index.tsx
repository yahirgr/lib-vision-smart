import { useState } from "react";
import { useCubicleSimulation } from "@/hooks/useCubicleSimulation";
import { CubicleGrid } from "@/components/CubicleGrid";
import { StatsBar } from "@/components/StatsBar";
import { AdminPanel } from "@/components/AdminPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, Shield, SlidersHorizontal, Building2, Layers } from "lucide-react";

const Index = () => {
  const [threshold, setThreshold] = useState(15);
  const { cubicles, logs, stats, yoloStatus } = useCubicleSimulation(threshold);
  const [floorFilter, setFloorFilter] = useState<"all" | "lower" | "upper">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "free">("all");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Eye className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="font-display text-lg font-bold tracking-tight">Lib-Vision AI</h1>
            <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">v1.0</Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-status-free cubicle-pulse" />
            <span className="hidden sm:inline">Sistema activo</span>
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
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-1">
                {(["all", "lower", "upper"] as const).map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={floorFilter === f ? "default" : "outline"}
                    onClick={() => setFloorFilter(f)}
                    className="text-xs h-7"
                  >
                    {f === "all" ? "Todas" : f === "lower" ? "Planta Baja" : "Planta Alta"}
                  </Button>
                ))}
              </div>
              <span className="text-border">|</span>
              <div className="flex gap-1">
                {(["all", "free"] as const).map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={statusFilter === f ? "default" : "outline"}
                    onClick={() => setStatusFilter(f)}
                    className="text-xs h-7"
                  >
                    {f === "all" ? "Todos" : "Solo disponibles"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm border-2 border-status-free bg-status-free-bg" /> Libre
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm border-2 border-status-occupied bg-status-occupied-bg" /> Ocupado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm border-2 border-status-reserved bg-status-reserved-bg" /> Apartado
              </span>
            </div>

            <CubicleGrid cubicles={cubicles} floorFilter={floorFilter} statusFilter={statusFilter} />

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <Layers className="h-3.5 w-3.5" />
              Mostrando {cubicles.filter((c) =>
                (floorFilter === "all" || c.floor === floorFilter) &&
                (statusFilter === "all" || c.status === "free")
              ).length} de {cubicles.length} cubículos
            </div>
          </TabsContent>

          <TabsContent value="admin" className="mt-4">
            <AdminPanel
              logs={logs}
              yoloStatus={yoloStatus}
              threshold={threshold}
              onThresholdChange={setThreshold}
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
