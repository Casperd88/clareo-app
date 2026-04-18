import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Audiobook, Chapter, SignedUrls } from "../types";
import { audiobooksApi } from "../api";

/**
 * Player State Machine:
 * 
 * States:
 * - idle: No audiobook loaded
 * - loading: Audiobook set, fetching signed URLs and preparing audio
 * - ready: Audio loaded and ready to play
 * - playing: Audio is playing
 * - paused: Audio is paused but ready
 * - error: An error occurred
 * 
 * Transitions:
 * - idle -> loading: loadAudiobook action
 * - loading -> ready: URLs fetched successfully
 * - ready -> playing: play action
 * - playing -> paused: pause action
 * - paused -> playing: play action
 * - any -> idle: clearPlayer action
 * - any -> error: error occurs
 * - any -> loading: loadAudiobook (switching books)
 */

export type PlayerStatus = "idle" | "loading" | "ready" | "playing" | "paused" | "error";

interface PlayerState {
  status: PlayerStatus;
  currentAudiobook: Audiobook | null;
  currentChapter: Chapter | null;
  signedUrls: SignedUrls | null;
  position: number;
  duration: number;
  playbackSpeed: number;
  error: string | null;
  audiobookId: string | null; // Track which audiobook's URLs we have
}

const initialState: PlayerState = {
  status: "idle",
  currentAudiobook: null,
  currentChapter: null,
  signedUrls: null,
  position: 0,
  duration: 0,
  playbackSpeed: 1.0,
  error: null,
  audiobookId: null,
};

// Async thunk to load a new audiobook with its signed URLs
export const loadAudiobook = createAsyncThunk(
  "player/loadAudiobook",
  async (
    { audiobook, startPosition = 0 }: { audiobook: Audiobook; startPosition?: number },
    { rejectWithValue }
  ) => {
    try {
      const signedUrlsResponse = await audiobooksApi.getSignedUrls(audiobook.id, 7200);
      return {
        audiobook,
        signedUrls: signedUrlsResponse.urls,
        startPosition,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to load audiobook"
      );
    }
  }
);

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    // Simple state setters
    setChapter: (state, action: PayloadAction<Chapter>) => {
      state.currentChapter = action.payload;
    },
    
    play: (state) => {
      if (state.status === "ready" || state.status === "paused") {
        state.status = "playing";
      }
    },
    
    pause: (state) => {
      if (state.status === "playing") {
        state.status = "paused";
      }
    },
    
    togglePlayback: (state) => {
      if (state.status === "playing") {
        state.status = "paused";
      } else if (state.status === "ready" || state.status === "paused") {
        state.status = "playing";
      }
    },
    
    setPosition: (state, action: PayloadAction<number>) => {
      state.position = action.payload;
    },
    
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    
    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.playbackSpeed = action.payload;
    },
    
    seekTo: (state, action: PayloadAction<number>) => {
      state.position = Math.max(0, Math.min(action.payload, state.duration));
    },
    
    skipForward: (state, action: PayloadAction<number>) => {
      state.position = Math.min(state.position + action.payload, state.duration);
    },
    
    skipBackward: (state, action: PayloadAction<number>) => {
      state.position = Math.max(state.position - action.payload, 0);
    },
    
    // Mark audio as ready (called after Audio.Sound is created)
    setReady: (state) => {
      if (state.status === "loading") {
        state.status = "ready";
      }
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.status = "error";
      }
    },
    
    clearError: (state) => {
      state.error = null;
      if (state.status === "error" && state.currentAudiobook) {
        state.status = "paused";
      }
    },
    
    // Clear player completely
    clearPlayer: () => initialState,
    
    // Legacy alias for clearPlayer
    clearAudiobook: () => initialState,
    reset: () => initialState,
    
    // Set audiobook with optional start position (for resuming playback)
    setAudiobook: (state, action: PayloadAction<{ audiobook: Audiobook; startPosition?: number } | Audiobook>) => {
      // Support both { audiobook, startPosition } and legacy Audiobook-only format
      const isLegacyFormat = 'id' in action.payload && 'title' in action.payload;
      const newAudiobook = isLegacyFormat ? action.payload as Audiobook : (action.payload as { audiobook: Audiobook; startPosition?: number }).audiobook;
      const startPosition = isLegacyFormat ? 0 : ((action.payload as { audiobook: Audiobook; startPosition?: number }).startPosition || 0);
      
      const isSameBook = state.currentAudiobook?.id === newAudiobook.id;
      
      if (!isSameBook) {
        // Reset everything for new book
        state.currentAudiobook = newAudiobook;
        state.audiobookId = null;
        state.signedUrls = null;
        state.currentChapter = null;
        state.position = startPosition;
        state.duration = 0;
        state.error = null;
        state.status = "loading";
      } else if (startPosition > 0 && state.position === 0) {
        // Same book but we have a saved position to restore
        state.position = startPosition;
      }
    },
    
    // Legacy setter for signed URLs
    setSignedUrls: (state, action: PayloadAction<SignedUrls>) => {
      // Only set if URLs are for current audiobook
      if (state.currentAudiobook) {
        state.signedUrls = action.payload;
        state.audiobookId = state.currentAudiobook.id;
      }
    },
    
    // Legacy loading setter
    setLoading: (state, action: PayloadAction<boolean>) => {
      if (action.payload && state.status !== "loading") {
        state.status = "loading";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAudiobook.pending, (state, action) => {
        const newAudiobookId = action.meta.arg.audiobook.id;
        const isSameBook = state.currentAudiobook?.id === newAudiobookId;
        
        // Always reset to loading state, clear old data
        state.status = "loading";
        state.error = null;
        
        if (!isSameBook) {
          // Full reset for different book
          state.currentAudiobook = action.meta.arg.audiobook;
          state.signedUrls = null;
          state.audiobookId = null;
          state.currentChapter = null;
          state.position = 0;
          state.duration = 0;
        }
      })
      .addCase(loadAudiobook.fulfilled, (state, action) => {
        const { audiobook, signedUrls, startPosition } = action.payload;
        
        // Verify this is still the current audiobook (user might have switched)
        if (state.currentAudiobook?.id === audiobook.id) {
          state.signedUrls = signedUrls;
          state.audiobookId = audiobook.id;
          state.position = startPosition;
          // Status will be set to "ready" by useAudioPlayer after audio loads
        }
      })
      .addCase(loadAudiobook.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload as string || "Failed to load audiobook";
      });
  },
});

export const {
  setChapter,
  play,
  pause,
  togglePlayback,
  setPosition,
  setDuration,
  setPlaybackSpeed,
  seekTo,
  skipForward,
  skipBackward,
  setReady,
  setError,
  clearError,
  clearPlayer,
  clearAudiobook,
  reset,
  setAudiobook,
  setSignedUrls,
  setLoading,
} = playerSlice.actions;

export default playerSlice.reducer;
