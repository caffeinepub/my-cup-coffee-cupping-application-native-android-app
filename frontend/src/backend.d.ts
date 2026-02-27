import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Location {
    latitude: number;
    longitude: number;
}
export type Timestamp = bigint;
export interface CoffeeScores {
    acidity: number;
    balance: number;
    cleanCup: number;
    sweetness: number;
    flavor: number;
    body: number;
    fragrance: number;
    overall: number;
    uniformity: number;
    aftertaste: number;
}
export interface Coffee {
    id: CoffeeId;
    name: string;
    origin: string;
    flavorProfile: string;
    roastLevel: string;
}
export interface CafeProfile {
    id: CafeId;
    averageScores: CoffeeScores;
    owner: Principal;
    name: string;
    availableCoffees: Array<Coffee>;
    availableFreeCups: bigint;
    roastLevel: string;
    location: Location;
    photos: Array<ExternalBlob>;
}
export interface QRCodeData {
    id: QRCodeId;
    redemptionTimestamp?: Timestamp;
    cafe: CafeId;
    redeemed: boolean;
    user: Principal;
    timestamp: Timestamp;
    coffee: CoffeeId;
}
export type CafeId = string;
export type CuppingId = string;
export interface CuppingHistory {
    acidity: bigint;
    balance: bigint;
    cleanCup: bigint;
    sweetness: bigint;
    flavor: bigint;
    body: bigint;
    fragrance: bigint;
    overall: bigint;
    uniformity: bigint;
    aftertaste: bigint;
}
export type CoffeeId = string;
export type QRCodeId = string;
export interface CuppingSubmission {
    id: CuppingId;
    cafe: CafeId;
    scores: CoffeeScores;
    user: Principal;
    timestamp: Timestamp;
    qrCodeId: QRCodeId;
    photo?: ExternalBlob;
    coffee: CoffeeId;
    intensityLevels: IntensityLevels;
}
export interface IntensityLevels {
    acidity: bigint;
    balance: bigint;
    flavor: bigint;
    body: bigint;
    fragrance: bigint;
    aftertaste: bigint;
}
export interface UserProfile {
    cuppingHistory: CuppingHistory;
    accuracyPercentage: number;
    completedCuppings: bigint;
    name: string;
    level: Level;
    progress: bigint;
}
export enum Level {
    intermediate = "intermediate",
    novice = "novice",
    advanced = "advanced",
    expert = "expert"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCoffeeToCafe(cafeId: CafeId, coffee: Coffee): Promise<void>;
    assignCafeOwner(cafeId: CafeId, owner: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCafeProfile(owner: Principal, name: string, latitude: number, longitude: number, roastLevel: string, availableFreeCups: bigint): Promise<CafeProfile>;
    exportCafeData(cafeId: CafeId): Promise<string>;
    generateQRCode(cafeId: CafeId, coffeeId: CoffeeId): Promise<QRCodeData>;
    getCafeForOwner(): Promise<CafeProfile | null>;
    getCafeProfile(cafeId: CafeId): Promise<CafeProfile | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCuppingsForCafe(cafeId: CafeId): Promise<Array<CuppingSubmission>>;
    getCuppingsForUser(user: Principal): Promise<Array<CuppingSubmission>>;
    getFilteredCafes(maxDistance: number, minRoastLevel: string): Promise<Array<CafeProfile>>;
    getProfile(user: Principal): Promise<UserProfile | null>;
    getQRCode(qrCodeId: QRCodeId): Promise<QRCodeData | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    redeemQRCode(qrCodeId: QRCodeId): Promise<void>;
    removeCoffeeFromCafe(cafeId: CafeId, coffeeId: CoffeeId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitCuppingForm(qrCodeId: QRCodeId, scores: CoffeeScores, intensityLevels: IntensityLevels, photo: ExternalBlob | null): Promise<void>;
    updateCafeFreeCups(cafeId: CafeId, availableFreeCups: bigint): Promise<void>;
}
