import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CafeId,
  CafeProfile,
  Coffee,
  CoffeeId,
  CoffeeScores,
  CuppingSubmission,
  DailyStats,
  IntensityLevels,
  QRCodeData,
  QRCodeId,
  UserProfile,
} from "../backend";
import type { ExternalBlob } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// Cafe Queries
export function useGetFilteredCafes() {
  const { actor, isFetching } = useActor();

  return useQuery<CafeProfile[]>({
    queryKey: ["cafes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFilteredCafes(1000, "");
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCafeProfile(cafeId: CafeId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<CafeProfile | null>({
    queryKey: ["cafe", cafeId],
    queryFn: async () => {
      if (!actor || !cafeId) return null;
      return actor.getCafeProfile(cafeId);
    },
    enabled: !!actor && !isFetching && !!cafeId,
  });
}

export function useGetCafeForOwner() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CafeProfile | null>({
    queryKey: ["ownerCafe"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCafeForOwner();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateCafeProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      owner: Principal;
      name: string;
      latitude: number;
      longitude: number;
      roastLevel: string;
      availableFreeCups: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createCafeProfile(
        params.owner,
        params.name,
        params.latitude,
        params.longitude,
        params.roastLevel,
        params.availableFreeCups,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cafes"] });
      queryClient.invalidateQueries({ queryKey: ["ownerCafe"] });
    },
  });
}

export function useUpdateCafeFreeCups() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      cafeId: CafeId;
      availableFreeCups: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateCafeFreeCups(params.cafeId, params.availableFreeCups);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cafes"] });
      queryClient.invalidateQueries({ queryKey: ["ownerCafe"] });
    },
  });
}

export function useAddCoffeeToCafe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { cafeId: CafeId; coffee: Coffee }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addCoffeeToCafe(params.cafeId, params.coffee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cafes"] });
      queryClient.invalidateQueries({ queryKey: ["ownerCafe"] });
    },
  });
}

export function useRemoveCoffeeFromCafe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { cafeId: CafeId; coffeeId: CoffeeId }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeCoffeeFromCafe(params.cafeId, params.coffeeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cafes"] });
      queryClient.invalidateQueries({ queryKey: ["ownerCafe"] });
    },
  });
}

// QR Code Queries
export function useGenerateQRCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { cafeId: CafeId; coffeeId: CoffeeId }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.generateQRCode(params.cafeId, params.coffeeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qrCodes"] });
    },
  });
}

export function useRedeemQRCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (qrCodeId: QRCodeId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.redeemQRCode(qrCodeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cafes"] });
      queryClient.invalidateQueries({ queryKey: ["qrCodes"] });
    },
  });
}

export function useGetQRCode(qrCodeId: QRCodeId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<QRCodeData | null>({
    queryKey: ["qrCode", qrCodeId],
    queryFn: async () => {
      if (!actor || !qrCodeId) return null;
      return actor.getQRCode(qrCodeId);
    },
    enabled: !!actor && !isFetching && !!qrCodeId,
  });
}

// Cupping Queries
export function useSubmitCuppingForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      qrCodeId: QRCodeId;
      scores: CoffeeScores;
      intensityLevels: IntensityLevels;
      photo: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitCuppingForm(
        params.qrCodeId,
        params.scores,
        params.intensityLevels,
        params.photo,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuppings"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetCuppingsForUser() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CuppingSubmission[]>({
    queryKey: ["cuppings", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getCuppingsForUser(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetCuppingsForCafe(cafeId: CafeId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<CuppingSubmission[]>({
    queryKey: ["cafeCuppings", cafeId],
    queryFn: async () => {
      if (!actor || !cafeId) return [];
      return actor.getCuppingsForCafe(cafeId);
    },
    enabled: !!actor && !isFetching && !!cafeId,
  });
}

export function useExportCafeData() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (cafeId: CafeId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.exportCafeData(cafeId);
    },
  });
}

// Admin Queries

/**
 * Checks whether the currently authenticated caller is the deployer/founder admin.
 * Uses actor.isAdmin() which checks the stable `admin` principal stored in the backend.
 * The identity principal is included in the queryKey so the query refetches on login/logout.
 */
export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalStr = identity?.getPrincipal().toString() ?? null;

  const query = useQuery<boolean>({
    // Include principalStr so the query re-runs whenever the logged-in user changes
    queryKey: ["isAdmin", principalStr],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isAdmin: query.data ?? false,
    isLoading: actorFetching || query.isLoading,
  };
}

/**
 * @deprecated Use useIsAdmin instead. Kept for backward compatibility.
 */
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin", identity?.getPrincipal().toString() ?? null],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetDailyStats() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { isAdmin } = useIsAdmin();

  return useQuery<Array<[string, DailyStats]>>({
    queryKey: ["dailyStats"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDailyStats();
    },
    enabled: !!actor && !isFetching && !!identity && isAdmin,
  });
}

// ── Seed Demo Cafes ───────────────────────────────────────────────────────

const DEMO_CAFES = [
  {
    name: "Kopi Selasar",
    latitude: -6.9014,
    longitude: 107.6186,
    roastLevel: "Light",
    availableFreeCups: BigInt(8),
    coffees: [
      {
        id: "c1",
        name: "Aceh Gayo Natural",
        origin: "Aceh, Indonesia",
        roastLevel: "Light",
        flavorProfile:
          "Fruity blueberry, honey sweetness, and a clean floral finish",
      },
      {
        id: "c2",
        name: "Flores Bajawa Washed",
        origin: "Flores, Indonesia",
        roastLevel: "Light",
        flavorProfile: "Bright citrus, red apple, and delicate jasmine aroma",
      },
    ],
  },
  {
    name: "Pagi Coffee Roastery",
    latitude: -6.9175,
    longitude: 107.6095,
    roastLevel: "Medium",
    availableFreeCups: BigInt(5),
    coffees: [
      {
        id: "c3",
        name: "Toraja Kalosi",
        origin: "Sulawesi, Indonesia",
        roastLevel: "Medium",
        flavorProfile: "Dark chocolate, caramel, and low-acid earthy notes",
      },
      {
        id: "c4",
        name: "Java Preanger",
        origin: "West Java, Indonesia",
        roastLevel: "Medium",
        flavorProfile: "Brown sugar, almond, and subtle herbal undertones",
      },
    ],
  },
  {
    name: "Ngopi Doeloe",
    latitude: -6.8948,
    longitude: 107.629,
    roastLevel: "Medium",
    availableFreeCups: BigInt(3),
    coffees: [
      {
        id: "c5",
        name: "Sumatra Mandheling",
        origin: "North Sumatra, Indonesia",
        roastLevel: "Medium",
        flavorProfile: "Earthy cedar, dark chocolate, and bold low acidity",
      },
      {
        id: "c6",
        name: "Papua Wamena",
        origin: "Papua, Indonesia",
        roastLevel: "Light",
        flavorProfile: "Tropical fruit, bright acidity, and clean sweet finish",
      },
    ],
  },
  {
    name: "Kedai Kopi Asli",
    latitude: -6.9245,
    longitude: 107.6013,
    roastLevel: "Dark",
    availableFreeCups: BigInt(10),
    coffees: [
      {
        id: "c7",
        name: "Robusta Lampung",
        origin: "Lampung, Indonesia",
        roastLevel: "Dark",
        flavorProfile: "Bold, smoky, with bitter chocolate and earthy depth",
      },
      {
        id: "c8",
        name: "Bali Kintamani Natural",
        origin: "Bali, Indonesia",
        roastLevel: "Dark",
        flavorProfile: "Sweet citrus peel, ripe plum, and a full-bodied finish",
      },
    ],
  },
  {
    name: "Warung Kopi Cihapit",
    latitude: -6.9082,
    longitude: 107.6355,
    roastLevel: "Light",
    availableFreeCups: BigInt(6),
    coffees: [
      {
        id: "c9",
        name: "Ethiopia Yirgacheffe",
        origin: "Ethiopia",
        roastLevel: "Light",
        flavorProfile: "Floral bergamot, bright citrus, and sweet stone fruit",
      },
      {
        id: "c10",
        name: "West Java Malabar",
        origin: "West Java, Indonesia",
        roastLevel: "Light",
        flavorProfile: "Fruity, wine-like acidity with a sweet honey finish",
      },
    ],
  },
];

export function useSeedDemoCafes() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      if (!identity) throw new Error("Must be logged in to seed demo cafes");

      const ownerPrincipal = identity.getPrincipal();

      for (const cafeData of DEMO_CAFES) {
        const cafe = await actor.createCafeProfile(
          ownerPrincipal,
          cafeData.name,
          cafeData.latitude,
          cafeData.longitude,
          cafeData.roastLevel,
          cafeData.availableFreeCups,
        );

        for (const coffee of cafeData.coffees) {
          await actor.addCoffeeToCafe(cafe.id, coffee);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cafes"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    },
  });
}
