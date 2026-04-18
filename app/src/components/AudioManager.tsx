import { useEffect, useRef, useCallback } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
import {
  MediaControl,
  PlaybackState,
  Command,
  MediaControlEvent,
} from "expo-media-control";
import { useAppDispatch, useAppSelector, useSignedUrls } from "../hooks";
import {
  setPosition,
  setDuration,
  setSignedUrls,
  play,
  pause,
  setReady,
  setError,
} from "../store/playerSlice";
import { playbackApi } from "../api";

/**
 * AudioManager - Manages audio playback at the app level
 * 
 * This component runs regardless of whether the full PlayerScreen is open,
 * ensuring audio plays even when only the MiniPlayer is visible.
 */
export function AudioManager() {
  const dispatch = useAppDispatch();
  const soundRef = useRef<Audio.Sound | null>(null);
  const currentAudioIdRef = useRef<string | null>(null);
  const mediaControlsInitializedForId = useRef<string | null>(null);

  const {
    status,
    currentAudiobook,
    signedUrls,
    audiobookId,
    position,
    duration,
    playbackSpeed,
  } = useAppSelector((state) => state.player);

  // Fetch signed URLs when audiobook changes
  const needsUrls = !!currentAudiobook && audiobookId !== currentAudiobook.id;
  const { data: fetchedUrls } = useSignedUrls(
    currentAudiobook?.id || '',
    needsUrls
  );

  // Dispatch signed URLs when fetched
  useEffect(() => {
    if (fetchedUrls?.urls && currentAudiobook && audiobookId !== currentAudiobook.id) {
      dispatch(setSignedUrls(fetchedUrls.urls));
    }
  }, [fetchedUrls, currentAudiobook, audiobookId, dispatch]);

  const isPlaying = status === "playing";
  const isReady = status === "ready" || status === "playing" || status === "paused";

  // Refs for current values
  const positionRef = useRef(position);
  const durationRef = useRef(duration);
  const isPlayingRef = useRef(isPlaying);
  const playbackSpeedRef = useRef(playbackSpeed);

  useEffect(() => { positionRef.current = position; }, [position]);
  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { playbackSpeedRef.current = playbackSpeed; }, [playbackSpeed]);

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        if (status.error) {
          dispatch(setError(status.error));
        }
        return;
      }

      dispatch(setPosition(status.positionMillis / 1000));
      
      if (status.durationMillis) {
        dispatch(setDuration(status.durationMillis / 1000));
      }

      if (status.didJustFinish) {
        dispatch(pause());
      }
    },
    [dispatch]
  );

  // Track previous audiobook for saving progress before switch
  const prevAudiobookRef = useRef<{ id: string; position: number } | null>(null);
  
  useEffect(() => {
    if (currentAudiobook && positionRef.current > 0) {
      prevAudiobookRef.current = { id: currentAudiobook.id, position: positionRef.current };
    }
  }, [currentAudiobook]);

  const unloadAudio = useCallback(async () => {
    // Save progress before unloading
    if (prevAudiobookRef.current && prevAudiobookRef.current.position > 0) {
      try {
        await playbackApi.updateState(prevAudiobookRef.current.id, {
          currentPosition: Math.floor(prevAudiobookRef.current.position),
          playbackSpeed: playbackSpeedRef.current,
          isCompleted: prevAudiobookRef.current.position >= durationRef.current - 5,
        });
      } catch {
        // Ignore save errors during unload
      }
    }
    
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {
        // Ignore cleanup errors
      }
      soundRef.current = null;
    }
  }, []);

  // Load audio when signed URLs are available
  useEffect(() => {
    const audioUrl = signedUrls?.audio;
    const bookId = audiobookId;
    // Capture position at the time of loading (important for resume)
    const startPositionMs = position * 1000;

    if (!audioUrl || !bookId) return;
    if (currentAudioIdRef.current === bookId && soundRef.current) return;

    const loadAudio = async () => {
      await unloadAudio();
      currentAudioIdRef.current = bookId;

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          {
            shouldPlay: false,
            positionMillis: startPositionMs,
            rate: playbackSpeedRef.current,
            progressUpdateIntervalMillis: 500,
          },
          onPlaybackStatusUpdate
        );

        if (currentAudioIdRef.current !== bookId) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
        dispatch(setReady());
        dispatch(play());
      } catch (error) {
        console.error("Error loading audio:", error);
        if (currentAudioIdRef.current === bookId) {
          dispatch(setError("Failed to load audio"));
        }
      }
    };

    loadAudio();
  }, [signedUrls?.audio, audiobookId, dispatch, onPlaybackStatusUpdate, unloadAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unloadAudio();
      MediaControl.disableMediaControls().catch(() => {});
    };
  }, [unloadAudio]);

  // Handle play/pause
  useEffect(() => {
    if (!soundRef.current) return;

    const updatePlayback = async () => {
      try {
        if (isPlaying) {
          await soundRef.current?.playAsync();
        } else {
          await soundRef.current?.pauseAsync();
          // Save progress immediately when pausing
          if (currentAudiobook && positionRef.current > 0) {
            playbackApi.updateState(currentAudiobook.id, {
              currentPosition: Math.floor(positionRef.current),
              playbackSpeed: playbackSpeedRef.current,
              isCompleted: positionRef.current >= durationRef.current - 5,
            }).catch((err) => console.error("Error saving on pause:", err));
          }
        }
      } catch (error) {
        console.error("Error updating playback:", error);
      }
    };

    updatePlayback();
  }, [isPlaying, currentAudiobook]);

  // Handle playback speed
  useEffect(() => {
    if (!soundRef.current || !isReady) return;
    soundRef.current.setRateAsync(playbackSpeed, true).catch(() => {});
  }, [playbackSpeed, isReady]);

  // Media controls
  useEffect(() => {
    if (!isReady || !currentAudiobook) return;

    const bookId = currentAudiobook.id;
    const needsInit = mediaControlsInitializedForId.current !== bookId;

    const initOrUpdateMediaControls = async () => {
      try {
        if (needsInit) {
          await MediaControl.enableMediaControls({
            capabilities: [
              Command.PLAY,
              Command.PAUSE,
              Command.SKIP_FORWARD,
              Command.SKIP_BACKWARD,
              Command.SEEK,
            ],
            ios: { skipInterval: 15 },
            android: { skipInterval: 15 },
          });
          mediaControlsInitializedForId.current = bookId;
        }

        await MediaControl.updateMetadata({
          title: currentAudiobook.title,
          artist: currentAudiobook.author?.name || "Unknown Author",
          duration: duration > 0 ? duration : undefined,
          artwork: signedUrls?.coverImage ? { uri: signedUrls.coverImage } : undefined,
        });

        await MediaControl.updatePlaybackState(
          isPlaying ? PlaybackState.PLAYING : PlaybackState.PAUSED,
          position,
          isPlaying ? playbackSpeed : 0
        );
      } catch (error) {
        console.error("Failed to update media controls:", error);
      }
    };

    initOrUpdateMediaControls();
  }, [isReady, currentAudiobook?.id, currentAudiobook?.title, signedUrls?.coverImage, duration]);

  // Media control playback state updates
  const lastPlayState = useRef(isPlaying);
  const lastSpeedState = useRef(playbackSpeed);

  useEffect(() => {
    if (!mediaControlsInitializedForId.current) return;

    if (lastPlayState.current !== isPlaying || lastSpeedState.current !== playbackSpeed) {
      MediaControl.updatePlaybackState(
        isPlaying ? PlaybackState.PLAYING : PlaybackState.PAUSED,
        position,
        isPlaying ? playbackSpeed : 0
      ).catch(() => {});
      
      lastPlayState.current = isPlaying;
      lastSpeedState.current = playbackSpeed;
    }
  }, [isPlaying, playbackSpeed, position]);

  // Media control event listener
  useEffect(() => {
    if (!isReady) return;

    const handleMediaEvent = async (event: MediaControlEvent) => {
      switch (event.command) {
        case Command.PLAY:
          dispatch(play());
          break;
        case Command.PAUSE:
          dispatch(pause());
          break;
        case Command.SKIP_FORWARD:
          if (soundRef.current) {
            const newPos = Math.min(
              positionRef.current + (event.data?.interval || 15),
              durationRef.current
            );
            await soundRef.current.setPositionAsync(newPos * 1000);
            dispatch(setPosition(newPos));
          }
          break;
        case Command.SKIP_BACKWARD:
          if (soundRef.current) {
            const newPos = Math.max(
              positionRef.current - (event.data?.interval || 15),
              0
            );
            await soundRef.current.setPositionAsync(newPos * 1000);
            dispatch(setPosition(newPos));
          }
          break;
        case Command.SEEK:
          if (soundRef.current && event.data?.position !== undefined) {
            await soundRef.current.setPositionAsync(event.data.position * 1000);
            dispatch(setPosition(event.data.position));
          }
          break;
      }
    };

    const removeListener = MediaControl.addListener(handleMediaEvent);
    return () => removeListener();
  }, [isReady, dispatch]);

  // Auto-save progress
  useEffect(() => {
    if (!isPlaying || !currentAudiobook) return;

    const saveProgress = async () => {
      try {
        await playbackApi.updateState(currentAudiobook.id, {
          currentPosition: Math.floor(positionRef.current),
          playbackSpeed: playbackSpeedRef.current,
          isCompleted: positionRef.current >= durationRef.current - 5,
        });
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    };

    const interval = setInterval(saveProgress, 30000);
    return () => clearInterval(interval);
  }, [isPlaying, currentAudiobook]);

  // Expose seek function globally for PlayerScreen
  useEffect(() => {
    (global as any).__audioManagerSeek = async (positionSec: number) => {
      if (!soundRef.current) return;
      const clampedPosition = Math.max(0, Math.min(positionSec, durationRef.current));
      await soundRef.current.setPositionAsync(clampedPosition * 1000);
      dispatch(setPosition(clampedPosition));
    };

    (global as any).__audioManagerSkipForward = async (seconds: number = 15) => {
      const newPosition = Math.min(positionRef.current + seconds, durationRef.current);
      await (global as any).__audioManagerSeek(newPosition);
    };

    (global as any).__audioManagerSkipBackward = async (seconds: number = 15) => {
      const newPosition = Math.max(positionRef.current - seconds, 0);
      await (global as any).__audioManagerSeek(newPosition);
    };

    (global as any).__audioManagerSaveProgress = async () => {
      if (!currentAudiobook) return;
      try {
        await playbackApi.updateState(currentAudiobook.id, {
          currentPosition: Math.floor(positionRef.current),
          playbackSpeed: playbackSpeedRef.current,
          isCompleted: positionRef.current >= durationRef.current - 5,
        });
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    };

    return () => {
      delete (global as any).__audioManagerSeek;
      delete (global as any).__audioManagerSkipForward;
      delete (global as any).__audioManagerSkipBackward;
      delete (global as any).__audioManagerSaveProgress;
    };
  }, [dispatch, currentAudiobook]);

  return null;
}
