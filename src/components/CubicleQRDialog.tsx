import { QRCodeSVG } from "qrcode.react";
import { Cubicle } from "@/hooks/useCubicleSimulation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  cubicle: Cubicle | null;
  onClose: () => void;
}

export function CubicleQRDialog({ cubicle, onClose }: Props) {
  if (!cubicle) return null;
  const value = `libvision://checkin/${cubicle.id}`;

  return (
    <Dialog open={!!cubicle} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" strokeWidth={2} />
            Check-in Cubículo #{cubicle.number}
          </DialogTitle>
          <DialogDescription>
            Escanea este código con la app móvil para registrar tu entrada al cubículo.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="rounded-xl bg-white p-4 shadow-sm border">
            <QRCodeSVG value={value} size={224} level="M" />
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">{value}</Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
}
