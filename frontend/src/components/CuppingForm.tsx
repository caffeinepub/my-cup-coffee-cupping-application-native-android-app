import { useState, useEffect } from 'react';
import { useSubmitCuppingForm, useGetCuppingsForUser } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { ExternalBlob, type CoffeeScores, type IntensityLevels } from '../backend';

const categories = [
  { key: 'fragrance', label: 'Fragrance/Aroma', hasIntensity: true },
  { key: 'flavor', label: 'Flavor', hasIntensity: true },
  { key: 'aftertaste', label: 'Aftertaste', hasIntensity: true },
  { key: 'acidity', label: 'Acidity', hasIntensity: true },
  { key: 'body', label: 'Body', hasIntensity: true },
  { key: 'balance', label: 'Balance', hasIntensity: true },
  { key: 'uniformity', label: 'Uniformity', hasIntensity: false },
  { key: 'sweetness', label: 'Sweetness', hasIntensity: false },
  { key: 'cleanCup', label: 'Clean Cup', hasIntensity: false },
  { key: 'overall', label: 'Overall', hasIntensity: false },
];

export default function CuppingForm() {
  const [qrCodeId, setQrCodeId] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({
    fragrance: 50,
    flavor: 50,
    aftertaste: 50,
    acidity: 50,
    body: 50,
    balance: 50,
    uniformity: 50,
    sweetness: 50,
    cleanCup: 50,
    overall: 50,
  });
  const [intensities, setIntensities] = useState<Record<string, number>>({
    fragrance: 5,
    flavor: 5,
    aftertaste: 5,
    acidity: 5,
    body: 5,
    balance: 5,
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const submitCupping = useSubmitCuppingForm();
  const { refetch: refetchCuppings } = useGetCuppingsForUser();

  // Check for deep link QR code (will be set by Capacitor when running as native app)
  useEffect(() => {
    const deepLinkQR = sessionStorage.getItem('deeplink_qr');
    if (deepLinkQR) {
      setQrCodeId(deepLinkQR);
      sessionStorage.removeItem('deeplink_qr');
    }
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!qrCodeId.trim()) {
      toast.error('Please enter a QR code ID');
      return;
    }

    try {
      let photoBlob: ExternalBlob | null = null;
      if (photo) {
        const arrayBuffer = await photo.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        photoBlob = ExternalBlob.fromBytes(uint8Array);
      }

      const cuppingScores: CoffeeScores = {
        fragrance: scores.fragrance,
        flavor: scores.flavor,
        aftertaste: scores.aftertaste,
        acidity: scores.acidity,
        body: scores.body,
        balance: scores.balance,
        uniformity: scores.uniformity,
        sweetness: scores.sweetness,
        cleanCup: scores.cleanCup,
        overall: scores.overall,
      };

      const intensityLevels: IntensityLevels = {
        fragrance: BigInt(intensities.fragrance),
        flavor: BigInt(intensities.flavor),
        aftertaste: BigInt(intensities.aftertaste),
        acidity: BigInt(intensities.acidity),
        body: BigInt(intensities.body),
        balance: BigInt(intensities.balance),
      };

      await submitCupping.mutateAsync({
        qrCodeId: qrCodeId.trim(),
        scores: cuppingScores,
        intensityLevels,
        photo: photoBlob,
      });

      toast.success('Cupping form submitted successfully!');
      setQrCodeId('');
      setPhoto(null);
      setPhotoPreview(null);
      refetchCuppings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit cupping form');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Submit Cupping Form</h2>
        <p className="text-muted-foreground">
          Evaluate your coffee using SCA cupping standards
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
            <CardDescription>Enter the QR code ID from your reservation</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="QR_123456"
              value={qrCodeId}
              onChange={(e) => setQrCodeId(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cupping Scores</CardTitle>
            <CardDescription>Rate each category from 0 to 100</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {categories.map((category) => (
              <div key={category.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{category.label}</Label>
                  <span className="text-sm font-medium">{scores[category.key]}</span>
                </div>
                <Slider
                  value={[scores[category.key]]}
                  onValueChange={(value) =>
                    setScores((prev) => ({ ...prev, [category.key]: value[0] }))
                  }
                  max={100}
                  step={1}
                  className="w-full"
                />
                {category.hasIntensity && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Intensity</Label>
                      <span className="text-sm">{intensities[category.key]}/10</span>
                    </div>
                    <Slider
                      value={[intensities[category.key]]}
                      onValueChange={(value) =>
                        setIntensities((prev) => ({ ...prev, [category.key]: value[0] }))
                      }
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photo (Optional)</CardTitle>
            <CardDescription>Upload a photo of your cupping session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" asChild>
                  <label className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </Button>
                {photo && <span className="text-sm text-muted-foreground">{photo.name}</span>}
              </div>
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="max-h-48 rounded-lg border object-cover"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={submitCupping.isPending}>
          {submitCupping.isPending ? 'Submitting...' : 'Submit Cupping Form'}
        </Button>
      </form>
    </div>
  );
}
