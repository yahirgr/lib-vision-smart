import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const dateFmt = new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "2-digit", month: "short" });
const timeFmt = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

export function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
      <Clock className="h-3.5 w-3.5" strokeWidth={2} />
      <span className="capitalize">{dateFmt.format(now).replace(".", "")}</span>
      <span className="text-border">·</span>
      <span className="font-semibold text-foreground">{timeFmt.format(now)}</span>
    </div>
  );
}
