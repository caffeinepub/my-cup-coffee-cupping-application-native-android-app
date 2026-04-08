// Backend types that mirror the Motoko backend definitions.
// These are manually maintained to match src/backend/main.mo

// Level is a Motoko variant — represented as a discriminated union of single-key objects
export type Level =
  | { readonly novice: null }
  | { readonly intermediate: null }
  | { readonly advanced: null }
  | { readonly expert: null };

/** Helper to get a human-readable label for a Level value */
export function getLevelLabel(level: Level): string {
  if ("novice" in level) return "Novice";
  if ("intermediate" in level) return "Intermediate";
  if ("advanced" in level) return "Advanced";
  if ("expert" in level) return "Expert";
  return "Unknown";
}

export interface CuppingHistory {
  fragrance: bigint;
  flavor: bigint;
  aftertaste: bigint;
  acidity: bigint;
  body: bigint;
  balance: bigint;
  uniformity: bigint;
  sweetness: bigint;
  cleanCup: bigint;
  overall: bigint;
}

export interface UserProfile {
  name: string;
  phoneNumber?: string | null;
  completedCuppings: bigint;
  accuracyPercentage: number;
  level: Level;
  progress: bigint;
  cuppingHistory: CuppingHistory;
}

export interface Coffee {
  id: string;
  name: string;
  origin: string;
  roastLevel: string;
  flavorProfile: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface CafeProfile {
  id: string;
  name: string;
  location: Location;
  roastLevel: string;
  availableFreeCups: bigint;
  availableCoffees: Coffee[];
  averageScores: CoffeeScores;
}

export type CafeId = string;
export type CoffeeId = string;
export type QRCodeId = string;

export interface QRCodeData {
  id: QRCodeId;
  cafe: CafeId;
  coffee: CoffeeId;
  user: string;
  redeemed: boolean;
  expiryTime: bigint;
  redemptionTimestamp?: bigint | null;
}

export interface CoffeeScores {
  fragrance: number;
  aroma: number;
  flavor: number;
  aftertaste: number;
  acidity: number;
  body: number;
  balance: number;
  uniformity: number;
  sweetness: number;
  cleanCup: number;
  overall: number;
}

export interface IntensityLevels {
  fragrance: bigint;
  flavor: bigint;
  aftertaste: bigint;
  acidity: bigint;
  body: bigint;
  balance: bigint;
}

export interface CuppingSubmission {
  id: string;
  user: string;
  cafe: CafeId;
  coffeeId: CoffeeId;
  scores: CoffeeScores;
  intensityLevels: IntensityLevels;
  timestamp: bigint;
  qrCodeId: QRCodeId;
}

export interface DailyStats {
  newUsers: bigint;
  cuppingSubmissions: bigint;
  qrCodesRedeemed: bigint;
  cafesRegistered: bigint;
}
