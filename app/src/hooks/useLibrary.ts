import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryApi, audiobooksApi, discoveryApi, onboardingApi } from "../api";

export function useLibrary() {
  return useQuery({
    queryKey: ["library"],
    queryFn: () => libraryApi.getAll(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCatalogue() {
  return useQuery({
    queryKey: ["catalogue"],
    queryFn: () => audiobooksApi.getAll(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAudiobook(id: string) {
  return useQuery({
    queryKey: ["audiobook", id],
    queryFn: () => audiobooksApi.getById(id),
    enabled: !!id,
  });
}

export function useSignedUrls(id: string, enabled = true) {
  return useQuery({
    queryKey: ["signedUrls", id],
    queryFn: () => audiobooksApi.getSignedUrls(id, 7200),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 60,
    refetchInterval: 1000 * 60 * 50,
  });
}

export function useSubtitles(
  id: string,
  chapter?: number,
  startTime?: number,
  endTime?: number
) {
  return useQuery({
    queryKey: ["subtitles", id, chapter, startTime, endTime],
    queryFn: () =>
      audiobooksApi.getSubtitles(id, { chapter, startTime, endTime }),
    enabled: !!id,
  });
}

export function useAddToLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (audiobookId: string) => libraryApi.add(audiobookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
}

export function useRemoveFromLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (audiobookId: string) => libraryApi.remove(audiobookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
}

export function useDiscovery() {
  return useQuery({
    queryKey: ["discovery"],
    queryFn: () => discoveryApi.getDiscovery(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ["userStats"],
    queryFn: () => onboardingApi.getStats(),
    staleTime: 1000 * 60 * 2, // Refresh every 2 minutes
  });
}

export function useUserPreferences() {
  return useQuery({
    queryKey: ["userPreferences"],
    queryFn: async () => {
      const res = await onboardingApi.getPreferences();
      return res?.preferences ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
}
