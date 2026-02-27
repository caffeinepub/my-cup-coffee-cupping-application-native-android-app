import { useState } from 'react';
import { useGenerateQRCode } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Coffee, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import type { CafeProfile, Coffee as CoffeeType } from '../backend';

interface CafeDetailDialogProps {
  cafe: CafeProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CafeDetailDialog({ cafe, open, onOpenChange }: CafeDetailDialogProps) {
  const [selectedCoffee, setSelectedCoffee] = useState<CoffeeType | null>(null);
  const [qrCodeId, setQrCodeId] = useState<string | null>(null);
  const generateQR = useGenerateQRCode();

  const handleReserveCoffee = async (coffee: CoffeeType) => {
    try {
      const qrData = await generateQR.mutateAsync({
        cafeId: cafe.id,
        coffeeId: coffee.id,
      });

      setQrCodeId(qrData.id);
      setSelectedCoffee(coffee);
      toast.success('Reservation created! Show this code at the cafe.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate reservation');
    }
  };

  const handleClose = () => {
    setQrCodeId(null);
    setSelectedCoffee(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{cafe.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {cafe.location.latitude.toFixed(4)}, {cafe.location.longitude.toFixed(4)}
          </DialogDescription>
        </DialogHeader>

        {qrCodeId && selectedCoffee ? (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Your Reservation</h3>
              <p className="text-sm text-muted-foreground">{selectedCoffee.name}</p>
            </div>
            <div className="flex justify-center">
              <div className="rounded-lg border bg-white p-6">
                <div className="space-y-2 text-center">
                  <div className="font-mono text-2xl font-bold text-gray-900">{qrCodeId}</div>
                  <p className="text-xs text-gray-600">Show this code at the cafe</p>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Present this reservation code at the cafe to redeem your free cup. You'll have 24 hours to submit
              your cupping form after redemption.
            </p>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Roast Level</span>
                <Badge variant="secondary">{cafe.roastLevel}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Available Free Cups</span>
                <Badge variant={Number(cafe.availableFreeCups) > 0 ? 'default' : 'outline'}>
                  {cafe.availableFreeCups.toString()}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Available Coffees</h3>
              {cafe.availableCoffees.length === 0 ? (
                <p className="text-sm text-muted-foreground">No coffees available</p>
              ) : (
                <div className="grid gap-3">
                  {cafe.availableCoffees.map((coffee) => (
                    <Card key={coffee.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <h4 className="font-medium">{coffee.name}</h4>
                            <p className="text-sm text-muted-foreground">Origin: {coffee.origin}</p>
                            <p className="text-sm text-muted-foreground">
                              Roast: {coffee.roastLevel}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {coffee.flavorProfile}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleReserveCoffee(coffee)}
                            disabled={
                              generateQR.isPending || Number(cafe.availableFreeCups) === 0
                            }
                          >
                            {generateQR.isPending ? 'Generating...' : 'Reserve'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
