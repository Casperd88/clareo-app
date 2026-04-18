import { apiClient } from "./client";
import type { Audiobook } from "../types";

export interface DiscoveryAudiobook extends Audiobook {
  coverImageUrl: string | null;
}

export interface DiscoverySection {
  id: string;
  title: string;
  subtitle?: string;
  type: "horizontal" | "grid" | "featured";
  audiobooks: DiscoveryAudiobook[];
}

export interface DiscoveryMeta {
  hasPreferences: boolean;
  hasLibrary: boolean;
  hasListeningHistory: boolean;
  isNewUser: boolean;
}

export interface DiscoveryResponse {
  sections: DiscoverySection[];
  greeting: string;
  totalBooks: number;
  meta?: DiscoveryMeta;
}

export interface GenrePageResponse {
  genre: { id: string; name: string };
  audiobooks: DiscoveryAudiobook[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const discoveryApi = {
  getDiscovery: async (): Promise<DiscoveryResponse> => {
    const { data } = await apiClient.get("/discovery");
    return data;
  },

  getGenre: async (
    genreId: string,
    page = 1,
    limit = 20
  ): Promise<GenrePageResponse> => {
    const { data } = await apiClient.get(`/discovery/genre/${genreId}`, {
      params: { page, limit },
    });
    return data;
  },
};
