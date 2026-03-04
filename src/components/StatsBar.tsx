import { Minus, User, Package, BarChart3 } from "lucide-react";

interface Props {
  stats: {
    total: number;
    free: number;
    occupied: number;
    reserved: number;
    occupancyPercent: number;
  };
}

export function StatsBar({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard icon={<Minus className="h-4 w-4 text-status-free" />} label="Libres" value={stats.free} color="free" />
      <StatCard icon={<User className="h-4 w-4 text-status-occupied" />} label="Ocupados" value={stats.occupied} color="occupied" />
      <StatCard icon={<Package className="h-4 w-4 text-status-reserved" />} label="Apartados" value={stats.reserved} color="reserved" />
      <StatCard icon={<BarChart3 className="h-4 w-4 text-primary" />} label="Ocupación" value={`${stats.occupancyPercent}%`} color="primary" />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-md ${color === "primary" ? "bg-primary/10" : `bg-status-${color}-bg`}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
