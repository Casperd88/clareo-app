import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "./useAppDispatch";
import { play, pause, PlayerStatus } from "../store/playerSlice";

interface AudioPlayerState {
  isReady: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  playbackSpeed: number;
  status: PlayerStatus;
  togglePlayPause: () => void;
  seekTo: (positionSec: number) => Promise<void>;
  skipForward: (seconds?: number) => Promise<void>;
  skipBackward: (seconds?: number) => Promise<void>;
  saveProgress: () => Promise<void>;
}

/**
 * useAudioPlayer - Hook for controlling audio playback
 * 
 * This hook provides a simple interface for the PlayerScreen to control playback.
 * The actual audio management is handled by the AudioManager component.
 */
export function useAudioPlayer(): AudioPlayerState {
  const dispatch = useAppDispatch();

  const {
    status,
    position,
    duration,
    playbackSpeed,
  } = useAppSelector((state) => state.player);

  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const isReady = status === "ready" || status === "playing" || status === "paused";

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      dispatch(pause());
    } else {
      dispatch(play());
    }
  }, [isPlaying, dispatch]);

  const seekTo = useCallback(async (positionSec: number) => {
    if ((global as any).__audioManagerSeek) {
      await (global as any).__audioManagerSeek(positionSec);
    }
  }, []);

  const skipForward = useCallback(async (seconds: number = 15) => {
    if ((global as any).__audioManagerSkipForward) {
      await (global as any).__audioManagerSkipForward(seconds);
    }
  }, []);

  const skipBackward = useCallback(async (seconds: number = 15) => {
    if ((global as any).__audioManagerSkipBackward) {
      await (global as any).__audioManagerSkipBackward(seconds);
    }
  }, []);

  const saveProgress = useCallback(async () => {
    if ((global as any).__audioManagerSaveProgress) {
      await (global as any).__audioManagerSaveProgress();
    }
  }, []);

  return useMemo(() => ({
    isReady,
    isPlaying,
    isLoading,
    position,
    duration,
    playbackSpeed,
    status,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    saveProgress,
  }), [
    isReady,
    isPlaying,
    isLoading,
    position,
    duration,
    playbackSpeed,
    status,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    saveProgress,
  ]);
}
