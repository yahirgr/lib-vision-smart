import { useState, useEffect, useCallback, useRef } from "react";

export type CubicleStatus = "free" | "occupied" | "reserved";
export type FloorType = "lower" | "upper";
export type CubicleType = "standard" | "private";

export interface Cubicle {
  id: string;
  number: number;
  status: CubicleStatus;
  floor: FloorType;
  type: CubicleType;
  capacity: number;
  detectedObjects: string[];
  personDetected: boolean;
  lastUpdate: Date;
  occupiedSince: Date | null;
  reservedSince: Date | null;
  reservationTimer: number | null; // countdown seconds remaining
}

export interface ActivityLog {
  id: string;
  cubicleId: string;
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
  const cubicles: Cubicle[] = [];
  let num = 1;

  // Planta Baja: 96 standard
  for (let i = 0; i < 96; i++) {
    cubicles.push(makeCubicle(num++, "lower", "standard", 1));
  }
  // Planta Baja: 15 private
  for (let i = 0; i < 15; i++) {
    cubicles.push(makeCubicle(num++, "lower", "private", 2));
  }
  // Planta Alta: 30 standard
  for (let i = 0; i < 30; i++) {
    cubicles.push(makeCubicle(num++, "upper", "standard", 1));
  }
  // Planta Alta: 15 private
  for (let i = 0; i < 15; i++) {
    cubicles.push(makeCubicle(num++, "upper", "private", 2));
  }

  return cubicles;
}

function makeCubicle(num: number, floor: FloorType, type: CubicleType, capacity: number): Cubicle {
  const roll = Math.random();
  const status: CubicleStatus = roll < 0.35 ? "occupied" : roll < 0.5 ? "reserved" : "free";
  const now = new Date();
  return {
    id: `${floor}-${type}-${num}`,
    number: num,
    status,
    floor,
    type,
    capacity,
    detectedObjects: status === "free" ? [] : randomObjects(),
    personDetected: status === "occupied",
    lastUpdate: now,
    occupiedSince: status === "occupied" ? new Date(now.getTime() - Math.random() * 3600000) : null,
    reservedSince: status === "reserved" ? new Date(now.getTime() - Math.random() * 1800000) : null,
    reservationTimer: null,
  };
}

export function useCubicleSimulation(releaseThresholdMinutes: number = 2) {
  const [cubicles, setCubicles] = useState<Cubicle[]>(initCubicles);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [yoloStatus, setYoloStatus] = useState({ fps: 24, confidence: 0.87, active: true });
  const logIdCounter = useRef(0);

  const addLog = useCallback((cubicleId: string, message: string, type: ActivityLog["type"] = "info") => {
    logIdCounter.current += 1;
    const newLog: ActivityLog = {
      id: `log-${logIdCounter.current}`,
      cubicleId,
      message,
      timestamp: new Date(),
      type,
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 150));
  }, []);

  // Reserve a cubicle (user clicks on free cubicle)
  const reserveCubicle = useCallback((cubicleId: string) => {
    setCubicles((prev) =>
      prev.map((c) => {
        if (c.id === cubicleId && c.status === "free") {
          addLog(c.id, `Cubículo #${c.number}: reservado por usuario → Timer de 2 min iniciado`, "info");
          return {
            ...c,
            status: "reserved" as CubicleStatus,
            reservedSince: new Date(),
            reservationTimer: 120, // 2 minutes in seconds
            personDetected: false,
            detectedObjects: [],
            lastUpdate: new Date(),
          };
        }
        return c;
      })
    );
  }, [addLog]);

  // Manual simulation: set detection state for a cubicle
  const simulateDetection = useCallback((cubicleId: string, mode: "person" | "objects" | "empty") => {
    const now = new Date();
    setCubicles((prev) =>
      prev.map((c) => {
        if (c.id !== cubicleId) return c;
        if (mode === "person") {
          addLog(c.id, `Cubículo #${c.number}: persona detectada manualmente → Ocupado`, "info");
          return {
            ...c,
            status: "occupied" as CubicleStatus,
            personDetected: true,
            detectedObjects: randomObjects(),
            occupiedSince: c.occupiedSince || now,
            reservedSince: null,
            reservationTimer: null,
            lastUpdate: now,
          };
        }
        if (mode === "objects") {
          const objects = randomObjects();
          addLog(c.id, `Cubículo #${c.number}: solo objetos (${objects.join(", ")}) → Apartado`, "warning");
          return {
            ...c,
            status: "reserved" as CubicleStatus,
            personDetected: false,
            detectedObjects: objects,
            occupiedSince: null,
            reservedSince: c.reservedSince || now,
            reservationTimer: null,
            lastUpdate: now,
          };
        }
        // empty
        addLog(c.id, `Cubículo #${c.number}: vacío detectado → Libre`, "info");
        return {
          ...c,
          status: "free" as CubicleStatus,
          personDetected: false,
          detectedObjects: [],
          occupiedSince: null,
          reservedSince: null,
          reservationTimer: null,
          lastUpdate: now,
        };
      })
    );
  }, [addLog]);

  // Simulate camera detections every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCubicles((prev) =>
        prev.map((c) => {
          // Skip cubicles with active reservation timer (user just reserved)
          if (c.reservationTimer !== null && c.reservationTimer > 0) return c;

          const roll = Math.random();
          if (roll > 0.95) {
            const now = new Date();
            if (c.status === "free" && Math.random() > 0.5) {
              const person = Math.random() > 0.3;
              const newStatus: CubicleStatus = person ? "occupied" : "reserved";
              const objects = randomObjects();
              addLog(
                c.id,
                person
                  ? `Cubículo #${c.number}: persona detectada → Ocupado`
                  : `Cubículo #${c.number}: objetos (${objects.join(", ")}), sin persona → Apartado`,
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
              const leavesObjects = Math.random() > 0.4;
              if (leavesObjects) {
                const objects = randomObjects();
                addLog(c.id, `Cubículo #${c.number}: persona salió, objetos dejados → Apartado`, "warning");
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
                addLog(c.id, `Cubículo #${c.number}: persona salió, vacío → Libre`, "info");
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

      setYoloStatus((prev) => ({
        ...prev,
        fps: Math.max(18, Math.min(30, prev.fps + (Math.random() - 0.5) * 4)),
        confidence: Math.max(0.75, Math.min(0.98, prev.confidence + (Math.random() - 0.5) * 0.06)),
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [addLog]);

  // Reservation timer countdown (every second)
  useEffect(() => {
    const interval = setInterval(() => {
      setCubicles((prev) =>
        prev.map((c) => {
          if (c.reservationTimer !== null && c.reservationTimer > 0) {
            const newTimer = c.reservationTimer - 1;
            if (newTimer <= 0 && !c.personDetected) {
              addLog(c.id, `⚡ Timer expirado: Cubículo #${c.number} sin presencia → Liberado`, "alert");
              return {
                ...c,
                status: "free" as CubicleStatus,
                reservationTimer: null,
                reservedSince: null,
                personDetected: false,
                detectedObjects: [],
                lastUpdate: new Date(),
              };
            }
            return { ...c, reservationTimer: newTimer };
          }
          return c;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [addLog]);

  // Auto-release reserved (apartado) cubicles after threshold
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCubicles((prev) =>
        prev.map((c) => {
          if (c.status === "reserved" && c.reservedSince && c.reservationTimer === null) {
            const elapsed = (now.getTime() - c.reservedSince.getTime()) / 60000;
            if (elapsed >= releaseThresholdMinutes) {
              addLog(
                c.id,
                `⚡ Agente reactivo: Cubículo #${c.number} apartado por ${Math.round(elapsed)} min → Liberado`,
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
          // Auto-release occupied cubicle if empty for 2 min
          if (c.status === "occupied" && !c.personDetected && c.detectedObjects.length === 0) {
            addLog(c.id, `⚡ Cubículo #${c.number}: vacío detectado → Liberado automáticamente`, "alert");
            return {
              ...c,
              status: "free" as CubicleStatus,
              occupiedSince: null,
              lastUpdate: now,
            };
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

  return { cubicles, logs, stats, yoloStatus, addLog, reserveCubicle, simulateDetection };
}
