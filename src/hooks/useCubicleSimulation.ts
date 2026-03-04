import { useState, useEffect, useCallback, useRef } from "react";

export type CubicleStatus = "free" | "occupied" | "reserved";

export interface Cubicle {
  id: number;
  status: CubicleStatus;
  floor: "lower" | "upper";
  detectedObjects: string[];
  personDetected: boolean;
  lastUpdate: Date;
  occupiedSince: Date | null;
  reservedSince: Date | null;
}

export interface ActivityLog {
  id: string;
  cubicleId: number;
  message: string;
  timestamp: Date;
  type: "info" | "warning" | "alert";
}

const OBJECTS = ["mochila", "libros", "laptop", "cuaderno", "botella"];

function randomObjects(): string[] {
  const count = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...OBJECTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function initCubicles(): Cubicle[] {
  return Array.from({ length: 32 }, (_, i) => {
    const roll = Math.random();
    const status: CubicleStatus = roll < 0.4 ? "occupied" : roll < 0.6 ? "reserved" : "free";
    const now = new Date();
    return {
      id: i + 1,
      status,
      floor: i < 16 ? "lower" : "upper",
      detectedObjects: status === "free" ? [] : randomObjects(),
      personDetected: status === "occupied",
      lastUpdate: now,
      occupiedSince: status === "occupied" ? new Date(now.getTime() - Math.random() * 3600000) : null,
      reservedSince: status === "reserved" ? new Date(now.getTime() - Math.random() * 1800000) : null,
    };
  });
}

export function useCubicleSimulation(releaseThresholdMinutes: number = 15) {
  const [cubicles, setCubicles] = useState<Cubicle[]>(initCubicles);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [yoloStatus, setYoloStatus] = useState({ fps: 24, confidence: 0.87, active: true });
  const logIdCounter = useRef(0);

  const addLog = useCallback((cubicleId: number, message: string, type: ActivityLog["type"] = "info") => {
    logIdCounter.current += 1;
    const newLog: ActivityLog = {
      id: `log-${logIdCounter.current}`,
      cubicleId,
      message,
      timestamp: new Date(),
      type,
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 100));
  }, []);

  // Simulate camera detections every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCubicles((prev) =>
        prev.map((c) => {
          const roll = Math.random();
          // 10% chance of state change per tick
          if (roll > 0.9) {
            const now = new Date();
            if (c.status === "free" && Math.random() > 0.5) {
              const person = Math.random() > 0.3;
              const newStatus: CubicleStatus = person ? "occupied" : "reserved";
              const objects = randomObjects();
              addLog(
                c.id,
                person
                  ? `Cubículo ${c.id}: persona detectada → Ocupado`
                  : `Cubículo ${c.id}: objetos detectados (${objects.join(", ")}), sin persona → Apartado`,
                "info"
              );
              return {
                ...c,
                status: newStatus,
                personDetected: person,
                detectedObjects: objects,
                lastUpdate: now,
                occupiedSince: person ? now : null,
                reservedSince: !person ? now : null,
              };
            }
            if (c.status === "occupied" && Math.random() > 0.7) {
              // Person leaves, maybe leaves objects
              const leavesObjects = Math.random() > 0.4;
              if (leavesObjects) {
                const objects = randomObjects();
                addLog(c.id, `Cubículo ${c.id}: persona salió, objetos dejados (${objects.join(", ")}) → Apartado`, "warning");
                return {
                  ...c,
                  status: "reserved" as CubicleStatus,
                  personDetected: false,
                  detectedObjects: objects,
                  lastUpdate: now,
                  occupiedSince: null,
                  reservedSince: now,
                };
              } else {
                addLog(c.id, `Cubículo ${c.id}: persona salió, cubículo vacío → Libre`, "info");
                return {
                  ...c,
                  status: "free" as CubicleStatus,
                  personDetected: false,
                  detectedObjects: [],
                  lastUpdate: now,
                  occupiedSince: null,
                  reservedSince: null,
                };
              }
            }
          }
          return c;
        })
      );

      // Fluctuate YOLO stats
      setYoloStatus((prev) => ({
        ...prev,
        fps: Math.max(18, Math.min(30, prev.fps + (Math.random() - 0.5) * 4)),
        confidence: Math.max(0.75, Math.min(0.98, prev.confidence + (Math.random() - 0.5) * 0.06)),
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [addLog]);

  // Reactive agent: auto-release reserved cubicles
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCubicles((prev) =>
        prev.map((c) => {
          if (c.status === "reserved" && c.reservedSince) {
            const elapsed = (now.getTime() - c.reservedSince.getTime()) / 60000;
            if (elapsed >= releaseThresholdMinutes) {
              addLog(
                c.id,
                `⚡ Agente reactivo: Cubículo ${c.id} apartado por ${Math.round(elapsed)} min → Liberado automáticamente`,
                "alert"
              );
              return {
                ...c,
                status: "free" as CubicleStatus,
                personDetected: false,
                detectedObjects: [],
                lastUpdate: now,
                reservedSince: null,
              };
            }
          }
          return c;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [releaseThresholdMinutes, addLog]);

  const stats = {
    total: cubicles.length,
    free: cubicles.filter((c) => c.status === "free").length,
    occupied: cubicles.filter((c) => c.status === "occupied").length,
    reserved: cubicles.filter((c) => c.status === "reserved").length,
    occupancyPercent: Math.round(
      (cubicles.filter((c) => c.status !== "free").length / cubicles.length) * 100
    ),
  };

  return { cubicles, logs, stats, yoloStatus, addLog };
}
