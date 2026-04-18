import { apiClient } from "./client";
import type { OnboardingData } from "../types";

export interface OnboardingPreferences {
  displayName: string;
  genres: string[];
  listeningHabits: string[];
  monthlyGoal: number;
  preferredSpeed: number;
  onboardingCompleted: boolean;
}

export interface UserPreferencesResponse {
  success: boolean;
  preferences: OnboardingPreferences;
}

export interface UserStats {
  completedThisMonth: number;
  totalCompleted: number;
  monthlyGoal: number;
  partialProgress: number;
  totalListeningMinutes: number;
  inProgressCount: number;
  progressPercent: number;
}

export const onboardingApi = {
  savePreferences: async (
    data: OnboardingData
  ): Promise<UserPreferencesResponse> => {
    const payload: OnboardingPreferences = {
      displayName: data.displayName,
      genres: data.selectedGenres,
      listeningHabits: data.listeningHabits,
      monthlyGoal: data.monthlyGoal,
      preferredSpeed: data.preferredSpeed,
      onboardingCompleted: true,
    };

    const { data: response } = await apiClient.post(
      "/users/preferences",
      payload
    );
    return response;
  },

  getPreferences: async (): Promise<UserPreferencesResponse | null> => {
    try {
      const { data } = await apiClient.get("/users/preferences");
      return data;
    } catch {
      return null;
    }
  },

  getStats: async (): Promise<UserStats> => {
    const { data } = await apiClient.get("/users/stats");
    return data;
  },
};
