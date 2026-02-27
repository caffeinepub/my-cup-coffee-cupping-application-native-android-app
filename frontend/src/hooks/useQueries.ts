import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  UserProfile,
  CafeProfile,
  Coffee,
  CuppingSubmission,
  QRCodeData,
  CoffeeScores,
  IntensityLevels,
  CafeId,
  CoffeeId,
  QRCodeId,
} from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Cafe Queries
export function useGetFilteredCafes() {
  const { actor, isFetching } = useActor();

  return useQuery<CafeProfile[]>({
    queryKey: ['cafes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFilteredCafes(1000, '');
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCafeProfile(cafeId: CafeId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<CafeProfile | null>({
    queryKey: ['cafe', cafeId],
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
    queryKey: ['ownerCafe'],
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
      if (!actor) throw new Error('Actor not available');
      return actor.createCafeProfile(
        params.owner,
        params.name,
        params.latitude,
        params.longitude,
        params.roastLevel,
        params.availableFreeCups
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cafes'] });
      queryClient.invalidateQueries({ queryKey: ['ownerCafe'] });
    },
  });
}

export function useUpdateCafeFreeCups() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { cafeId: CafeId; availableFreeCups: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCafeFreeCups(params.cafeId, params.availableFreeCups);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cafes'] });
      queryClient.invalidateQueries({ queryKey: ['ownerCafe'] });
    },
  });
}

export function useAddCoffeeToCafe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { cafeId: CafeId; coffee: Coffee }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCoffeeToCafe(params.cafeId, params.coffee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cafes'] });
      queryClient.invalidateQueries({ queryKey: ['ownerCafe'] });
    },
  });
}

export function useRemoveCoffeeFromCafe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { cafeId: CafeId; coffeeId: CoffeeId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeCoffeeFromCafe(params.cafeId, params.coffeeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cafes'] });
      queryClient.invalidateQueries({ queryKey: ['ownerCafe'] });
    },
  });
}

// QR Code Queries
export function useGenerateQRCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { cafeId: CafeId; coffeeId: CoffeeId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateQRCode(params.cafeId, params.coffeeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] });
    },
  });
}

export function useRedeemQRCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (qrCodeId: QRCodeId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.redeemQRCode(qrCodeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cafes'] });
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] });
    },
  });
}

export function useGetQRCode(qrCodeId: QRCodeId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<QRCodeData | null>({
    queryKey: ['qrCode', qrCodeId],
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
      if (!actor) throw new Error('Actor not available');
      return actor.submitCuppingForm(
        params.qrCodeId,
        params.scores,
        params.intensityLevels,
        params.photo
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuppings'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCuppingsForUser() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CuppingSubmission[]>({
    queryKey: ['cuppings', identity?.getPrincipal().toString()],
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
    queryKey: ['cafeCuppings', cafeId],
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
      if (!actor) throw new Error('Actor not available');
      return actor.exportCafeData(cafeId);
    },
  });
}

// Admin Queries
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}
