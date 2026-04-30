export function formatDuration(from: Date | null): string {
  if (!from) return "—";
  const mins = Math.round((Date.now() - from.getTime()) / 60000);
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
