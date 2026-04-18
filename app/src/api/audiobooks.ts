import { apiClient } from "./client";
import type {
  Audiobook,
  LibraryItem,
  AudiobookSignedUrls,
  PlaybackState,
  Segment,
} from "../types";

export interface AudiobooksResponse {
  audiobooks: Audiobook[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LibraryResponse {
  library: LibraryItem[];
}

export const audiobooksApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    genre?: string;
  }): Promise<AudiobooksResponse> => {
    const { data } = await apiClient.get("/audiobooks", { params });
    return data;
  },

  getById: async (id: string): Promise<Audiobook> => {
    const { data } = await apiClient.get(`/audiobooks/${id}`);
    return data;
  },

  getSignedUrls: async (
    id: string,
    expiresIn?: number
  ): Promise<AudiobookSignedUrls> => {
    const { data } = await apiClient.get(`/media/audiobooks/${id}/signed-urls`, {
      params: { expiresIn },
    });
    return data;
  },

  getSubtitles: async (
    id: string,
    params?: {
      chapter?: number;
      startTime?: number;
      endTime?: number;
    }
  ): Promise<{ segments: Segment[] }> => {
    const { data } = await apiClient.get(`/media/audiobooks/${id}/subtitles`, {
      params,
    });
    return data;
  },
};

export const libraryApi = {
  getAll: async (): Promise<LibraryResponse> => {
    const { data } = await apiClient.get("/library");
    return data;
  },

  add: async (audiobookId: string): Promise<LibraryItem> => {
    const { data } = await apiClient.post("/library", { audiobookId });
    return data;
  },

  remove: async (audiobookId: string): Promise<void> => {
    await apiClient.delete(`/library/${audiobookId}`);
  },
};

export const playbackApi = {
  getState: async (
    audiobookId: string
  ): Promise<{ playbackState: PlaybackState | null }> => {
    const { data } = await apiClient.get(`/playback/${audiobookId}`);
    return data;
  },

  updateState: async (
    audiobookId: string,
    state: Partial<PlaybackState>
  ): Promise<{ playbackState: PlaybackState }> => {
    const { data } = await apiClient.put(`/playback/${audiobookId}`, state);
    return data;
  },

  getContinueListening: async (): Promise<{
    continueListening: (PlaybackState & { audiobook: Audiobook }) | null;
  }> => {
    const { data } = await apiClient.get("/playback/continue");
    return data;
  },
};
