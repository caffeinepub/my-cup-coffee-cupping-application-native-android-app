import { useState } from 'react';
import {
  useGetCafeForOwner,
  useUpdateCafeFreeCups,
  useAddCoffeeToCafe,
  useRemoveCoffeeFromCafe,
  useGetCuppingsForCafe,
  useExportCafeData,
} from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Coffee, Download, Plus, Trash2, TrendingUp } from 'lucide-react';
import type { Coffee as CoffeeType, CoffeeScores } from '../backend';
import CuppingRadarChart from './CuppingRadarChart';

export default function CafeDashboard() {
  const { data: cafe } = useGetCafeForOwner();
  const { data: cuppings } = useGetCuppingsForCafe(cafe?.id || null);
  const updateFreeCups = useUpdateCafeFreeCups();
  const addCoffee = useAddCoffeeToCafe();
  const removeCoffee = useRemoveCoffeeFromCafe();
  const exportData = useExportCafeData();

  const [freeCups, setFreeCups] = useState('');
  const [showAddCoffee, setShowAddCoffee] = useState(false);
  const [newCoffee, setNewCoffee] = useState({
    id: '',
    name: '',
    origin: '',
    roastLevel: '',
    flavorProfile: '',
  });

  if (!cafe) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Coffee className="h-16 w-16 text-muted-foreground" />
        <p className="mt-4 text-lg text-muted-foreground">
          You don't have a cafe yet. Contact an admin to set up your cafe.
        </p>
      </div>
    );
  }

  const handleUpdateFreeCups = async () => {
    const cups = parseInt(freeCups);
    if (isNaN(cups) || cups < 0) {
      toast.error('Please enter a valid number');
      return;
    }

    try {
      await updateFreeCups.mutateAsync({
        cafeId: cafe.id,
        availableFreeCups: BigInt(cups),
      });
      toast.success('Free cups updated successfully');
      setFreeCups('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update free cups');
    }
  };

  const handleAddCoffee = async () => {
    if (!newCoffee.id || !newCoffee.name || !newCoffee.origin) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addCoffee.mutateAsync({
        cafeId: cafe.id,
        coffee: newCoffee as CoffeeType,
      });
      toast.success('Coffee added successfully');
      setNewCoffee({ id: '', name: '', origin: '', roastLevel: '', flavorProfile: '' });
      setShowAddCoffee(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add coffee');
    }
  };

  const handleRemoveCoffee = async (coffeeId: string) => {
    try {
      await removeCoffee.mutateAsync({ cafeId: cafe.id, coffeeId });
      toast.success('Coffee removed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove coffee');
    }
  };

  const handleExport = async () => {
    try {
      const csvData = await exportData.mutateAsync(cafe.id);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cafe.name}-cupping-data.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export data');
    }
  };

  const averageScore =
    cuppings && cuppings.length > 0
      ? cuppings.reduce((sum, c) => sum + c.scores.overall, 0) / cuppings.length
      : 0;

  // Calculate average scores across all categories
  const averageScores: CoffeeScores | null =
    cuppings && cuppings.length > 0
      ? {
          fragrance: cuppings.reduce((sum, c) => sum + c.scores.fragrance, 0) / cuppings.length,
          flavor: cuppings.reduce((sum, c) => sum + c.scores.flavor, 0) / cuppings.length,
          aftertaste: cuppings.reduce((sum, c) => sum + c.scores.aftertaste, 0) / cuppings.length,
          acidity: cuppings.reduce((sum, c) => sum + c.scores.acidity, 0) / cuppings.length,
          body: cuppings.reduce((sum, c) => sum + c.scores.body, 0) / cuppings.length,
          balance: cuppings.reduce((sum, c) => sum + c.scores.balance, 0) / cuppings.length,
          uniformity: cuppings.reduce((sum, c) => sum + c.scores.uniformity, 0) / cuppings.length,
          sweetness: cuppings.reduce((sum, c) => sum + c.scores.sweetness, 0) / cuppings.length,
          cleanCup: cuppings.reduce((sum, c) => sum + c.scores.cleanCup, 0) / cuppings.length,
          overall: cuppings.reduce((sum, c) => sum + c.scores.overall, 0) / cuppings.length,
        }
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{cafe.name}</h2>
          <p className="text-muted-foreground">Manage your cafe</p>
        </div>
        <Button onClick={handleExport} disabled={exportData.isPending}>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Free Cups</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cafe.availableFreeCups.toString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cuppings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cuppings?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {averageScores && (
        <Card>
          <CardHeader>
            <CardTitle>Average Cupping Scores</CardTitle>
            <CardDescription>
              Aggregated scores across all coffees at your cafe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CuppingRadarChart 
              scores={averageScores} 
              title="All Coffees Average Performance"
            />
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Based on {cuppings?.length || 0} cupping{cuppings?.length !== 1 ? 's' : ''}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Update Free Cups</CardTitle>
          <CardDescription>Set the number of available free cups for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter number of free cups"
              value={freeCups}
              onChange={(e) => setFreeCups(e.target.value)}
              min="0"
            />
            <Button onClick={handleUpdateFreeCups} disabled={updateFreeCups.isPending}>
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Available Coffees</CardTitle>
              <CardDescription>Manage your coffee inventory</CardDescription>
            </div>
            <Dialog open={showAddCoffee} onOpenChange={setShowAddCoffee}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Coffee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Coffee</DialogTitle>
                  <DialogDescription>Add a new coffee to your inventory</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coffeeId">Coffee ID *</Label>
                    <Input
                      id="coffeeId"
                      value={newCoffee.id}
                      onChange={(e) => setNewCoffee({ ...newCoffee, id: e.target.value })}
                      placeholder="e.g., COFFEE_001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coffeeName">Name *</Label>
                    <Input
                      id="coffeeName"
                      value={newCoffee.name}
                      onChange={(e) => setNewCoffee({ ...newCoffee, name: e.target.value })}
                      placeholder="e.g., Ethiopian Yirgacheffe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin *</Label>
                    <Input
                      id="origin"
                      value={newCoffee.origin}
                      onChange={(e) => setNewCoffee({ ...newCoffee, origin: e.target.value })}
                      placeholder="e.g., Ethiopia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roastLevel">Roast Level</Label>
                    <Input
                      id="roastLevel"
                      value={newCoffee.roastLevel}
                      onChange={(e) =>
                        setNewCoffee({ ...newCoffee, roastLevel: e.target.value })
                      }
                      placeholder="e.g., Light, Medium, Dark"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="flavorProfile">Flavor Profile</Label>
                    <Input
                      id="flavorProfile"
                      value={newCoffee.flavorProfile}
                      onChange={(e) =>
                        setNewCoffee({ ...newCoffee, flavorProfile: e.target.value })
                      }
                      placeholder="e.g., Floral, citrus, honey"
                    />
                  </div>
                  <Button onClick={handleAddCoffee} className="w-full" disabled={addCoffee.isPending}>
                    {addCoffee.isPending ? 'Adding...' : 'Add Coffee'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {cafe.availableCoffees.length === 0 ? (
            <p className="text-sm text-muted-foreground">No coffees added yet</p>
          ) : (
            <div className="space-y-3">
              {cafe.availableCoffees.map((coffee) => (
                <div
                  key={coffee.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{coffee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {coffee.origin} • {coffee.roastLevel}
                    </p>
                    {coffee.flavorProfile && (
                      <p className="text-sm text-muted-foreground">{coffee.flavorProfile}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveCoffee(coffee.id)}
                    disabled={removeCoffee.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
