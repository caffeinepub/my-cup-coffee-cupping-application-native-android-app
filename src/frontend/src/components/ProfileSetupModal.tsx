import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useQueries";
import type { Level } from "../types/backend-types";

export default function ProfileSetupModal() {
  const [name, setName] = useState("");
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        completedCuppings: BigInt(0),
        accuracyPercentage: 0,
        level: { novice: null } as Level,
        progress: BigInt(0),
        cuppingHistory: {
          fragrance: BigInt(0),
          flavor: BigInt(0),
          aftertaste: BigInt(0),
          acidity: BigInt(0),
          body: BigInt(0),
          balance: BigInt(0),
          uniformity: BigInt(0),
          sweetness: BigInt(0),
          cleanCup: BigInt(0),
          overall: BigInt(0),
        },
      });
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error("Failed to create profile");
      console.error(error);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Welcome to My Cup!</DialogTitle>
          <DialogDescription>
            Let's set up your profile to get started with your coffee cupping
            journey.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? "Creating Profile..." : "Get Started"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
