import { useState } from 'react';
import { useRedeemQRCode } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useQRScanner } from '../qr-code/useQRScanner';
import { Camera, CheckCircle2, XCircle } from 'lucide-react';

export default function QRCodeScanner() {
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const redeemQR = useRedeemQRCode();

  const {
    qrResults,
    isScanning,
    isActive,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    clearResults,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: 'environment',
    scanInterval: 100,
    maxResults: 1,
  });

  const handleRedeem = async (qrCodeId: string) => {
    try {
      await redeemQR.mutateAsync(qrCodeId);
      toast.success('QR code redeemed successfully!');
      setLastScannedCode(qrCodeId);
      clearResults();
      stopScanning();
    } catch (error: any) {
      toast.error(error.message || 'Failed to redeem QR code');
    }
  };

  const latestResult = qrResults[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">QR Code Scanner</h2>
        <p className="text-muted-foreground">Scan QR codes to redeem free cups</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scanner</CardTitle>
          <CardDescription>
            Position the QR code within the camera view
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={startScanning}
              disabled={!canStartScanning || isActive}
              className="flex-1"
            >
              {isLoading ? 'Loading...' : 'Start Scanning'}
            </Button>
            <Button
              onClick={stopScanning}
              disabled={isLoading || !isActive}
              variant="outline"
              className="flex-1"
            >
              Stop Scanning
            </Button>
          </div>

          {latestResult && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">QR Code Detected</p>
                  <p className="text-sm">{latestResult.data}</p>
                  <Button
                    size="sm"
                    onClick={() => handleRedeem(latestResult.data)}
                    disabled={redeemQR.isPending}
                  >
                    {redeemQR.isPending ? 'Redeeming...' : 'Redeem'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {lastScannedCode && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Last redeemed: {lastScannedCode}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
