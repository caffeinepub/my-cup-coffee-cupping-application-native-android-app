import { useState } from 'react';
import { useGetFilteredCafes } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Coffee, Star } from 'lucide-react';
import CafeDetailDialog from './CafeDetailDialog';
import type { CafeProfile } from '../backend';

export default function MapView() {
  const { data: cafes, isLoading } = useGetFilteredCafes();
  const [selectedCafe, setSelectedCafe] = useState<CafeProfile | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading cafes...</p>
      </div>
    );
  }

  if (!cafes || cafes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Coffee className="h-16 w-16 text-muted-foreground" />
        <p className="mt-4 text-lg text-muted-foreground">No cafes available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Discover Cafes</h2>
          <p className="text-muted-foreground">Find participating cafes near you</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cafes.map((cafe) => (
          <Card key={cafe.id} className="overflow-hidden transition-shadow hover:shadow-lg">
            <div className="aspect-video w-full bg-muted">
              {cafe.photos.length > 0 ? (
                <img
                  src={cafe.photos[0].getDirectURL()}
                  alt={cafe.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Coffee className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-1">{cafe.name}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {cafe.location.latitude.toFixed(4)}, {cafe.location.longitude.toFixed(4)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Roast Level</span>
                  <Badge variant="secondary">{cafe.roastLevel}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Free Cups</span>
                  <Badge variant={Number(cafe.availableFreeCups) > 0 ? 'default' : 'outline'}>
                    {cafe.availableFreeCups.toString()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Coffees</span>
                  <span className="text-sm font-medium">{cafe.availableCoffees.length}</span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => setSelectedCafe(cafe)}
                  disabled={Number(cafe.availableFreeCups) === 0}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCafe && (
        <CafeDetailDialog
          cafe={selectedCafe}
          open={!!selectedCafe}
          onOpenChange={(open) => !open && setSelectedCafe(null)}
        />
      )}
    </div>
  );
}
