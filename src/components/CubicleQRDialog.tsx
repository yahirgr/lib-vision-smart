import { QRCodeSVG } from "qrcode.react";
import { Cubicle } from "@/hooks/useCubicleSimulation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { QrCode, ScanLine, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  cubicle: Cubicle | null;
  onClose: () => void;
  onCheckIn: (id: string) => void;
}

export function CubicleQRDialog({ cubicle, onClose, onCheckIn }: Props) {
  if (!cubicle) return null;
  const value = `libvision://checkin/${cubicle.id}`;
  const isOccupied = cubicle.status === "occupied";

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
        <DialogFooter>
          {isOccupied ? (
            <Button disabled className="w-full gap-2" variant="secondary">
              <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
              Cubículo ya ocupado
            </Button>
          ) : (
            <Button
              className="w-full gap-2"
              onClick={() => {
                onCheckIn(cubicle.id);
                onClose();
              }}
            >
              <ScanLine className="h-4 w-4" strokeWidth={2} />
              Simular Escaneo de Alumno
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
