import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type {
  OnboardingState,
  OnboardingData,
  ListeningHabit,
  PlaybackSpeedPreference,
} from "../types";
import { onboardingApi } from "../api";

const DEFAULT_TOTAL_STEPS = 5;

interface OnboardingSliceState extends OnboardingState {
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: OnboardingSliceState = {
  currentStep: 0,
  totalSteps: DEFAULT_TOTAL_STEPS,
  isComplete: false,
  isSaving: false,
  isLoading: false,
  error: null,
  data: {
    displayName: "",
    selectedGenres: [],
    listeningHabits: [],
    monthlyGoal: 2,
    preferredSpeed: 1,
  },
};

export const saveOnboardingPreferences = createAsyncThunk(
  "onboarding/savePreferences",
  async (data: OnboardingData, { rejectWithValue }) => {
    try {
      const response = await onboardingApi.savePreferences(data);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to save preferences"
      );
    }
  }
);

export const fetchOnboardingPreferences = createAsyncThunk(
  "onboarding/fetchPreferences",
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingApi.getPreferences();
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch preferences"
      );
    }
  }
);

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps - 1) {
        state.currentStep += 1;
      }
    },
    previousStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    goToStep: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.totalSteps) {
        state.currentStep = action.payload;
      }
    },
    setTotalSteps: (state, action: PayloadAction<number>) => {
      const next = Math.max(1, action.payload);
      state.totalSteps = next;
      if (state.currentStep > next - 1) {
        state.currentStep = next - 1;
      }
    },
    setDisplayName: (state, action: PayloadAction<string>) => {
      state.data.displayName = action.payload;
    },
    toggleGenre: (state, action: PayloadAction<string>) => {
      const genre = action.payload;
      const index = state.data.selectedGenres.indexOf(genre);
      if (index === -1) {
        state.data.selectedGenres.push(genre);
      } else {
        state.data.selectedGenres.splice(index, 1);
      }
    },
    setGenres: (state, action: PayloadAction<string[]>) => {
      state.data.selectedGenres = action.payload;
    },
    toggleListeningHabit: (state, action: PayloadAction<ListeningHabit>) => {
      const habit = action.payload;
      const index = state.data.listeningHabits.indexOf(habit);
      if (index === -1) {
        state.data.listeningHabits.push(habit);
      } else {
        state.data.listeningHabits.splice(index, 1);
      }
    },
    setListeningHabits: (state, action: PayloadAction<ListeningHabit[]>) => {
      state.data.listeningHabits = action.payload;
    },
    setMonthlyGoal: (state, action: PayloadAction<number>) => {
      state.data.monthlyGoal = action.payload;
    },
    setPreferredSpeed: (state, action: PayloadAction<PlaybackSpeedPreference>) => {
      state.data.preferredSpeed = action.payload;
    },
    completeOnboarding: (state) => {
      state.isComplete = true;
    },
    resetOnboarding: () => initialState,
    setOnboardingData: (state, action: PayloadAction<Partial<OnboardingData>>) => {
      state.data = { ...state.data, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveOnboardingPreferences.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveOnboardingPreferences.fulfilled, (state) => {
        state.isSaving = false;
        state.isComplete = true;
      })
      .addCase(saveOnboardingPreferences.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOnboardingPreferences.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOnboardingPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.preferences?.onboardingCompleted) {
          state.isComplete = true;
          state.data = {
            displayName: action.payload.preferences.displayName || "",
            selectedGenres: action.payload.preferences.genres || [],
            listeningHabits: (action.payload.preferences.listeningHabits || []) as ListeningHabit[],
            monthlyGoal: action.payload.preferences.monthlyGoal || 2,
            preferredSpeed: (action.payload.preferences.preferredSpeed || 1) as PlaybackSpeedPreference,
          };
        }
      })
      .addCase(fetchOnboardingPreferences.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  nextStep,
  previousStep,
  goToStep,
  setTotalSteps,
  setDisplayName,
  toggleGenre,
  setGenres,
  toggleListeningHabit,
  setListeningHabits,
  setMonthlyGoal,
  setPreferredSpeed,
  completeOnboarding,
  resetOnboarding,
  setOnboardingData,
  clearError,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;

export type { OnboardingSliceState };
