import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShaderBackground,
  TopBar,
  CoverArt,
  TrackInfo,
  ProgressBar,
  PlayerControls,
  Subtitles,
} from '../components';
import {
  useAppSelector,
  useAppDispatch,
  useSubtitles,
  useAudioPlayer,
  useAudiobook,
} from '../hooks';
import { clearPlayer } from '../store/playerSlice';
import { useTheme } from '../theme';
import type { AppTheme } from '../theme';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

interface PlayerScreenProps {
  onClose?: () => void;
}

export function PlayerScreen({ onClose }: PlayerScreenProps) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    currentAudiobook,
    signedUrls,
    audiobookId,
    status: playerStatus,
    error: playerError,
  } = useAppSelector((state) => state.player);

  const { data: audiobookDetails } = useAudiobook(currentAudiobook?.id || '');
  const { data: subtitlesData } = useSubtitles(currentAudiobook?.id || '');

  const chapters = audiobookDetails?.chapters || currentAudiobook?.chapters;

  const {
    isPlaying,
    isReady,
    isLoading: audioLoading,
    position,
    duration,
    togglePlayPause,
    skipForward,
    skipBackward,
    seekTo,
    saveProgress,
  } = useAudioPlayer();

  const handleSeek = useCallback(
    (prog: number, shouldPlay = false) => {
      if (duration > 0) {
        seekTo(prog * duration);
        if (shouldPlay && !isPlaying) {
          togglePlayPause();
        }
      }
    },
    [duration, isPlaying, seekTo, togglePlayPause],
  );

  const isLoadingState = playerStatus === 'loading' || audioLoading;

  const handleBack = useCallback(async () => {
    await saveProgress();
    if (onClose) {
      onClose();
    } else {
      dispatch(clearPlayer());
    }
  }, [dispatch, saveProgress, onClose]);

  // The player screen always paints over its own dark scrim, regardless
  // of light/dark scheme — the cover-art shader is the design.
  const isAudioActive = useMemo(() => {
    if (!subtitlesData?.segments) return true;
    return subtitlesData.segments.some(
      (seg) => position >= seg.startTime - 0.3 && position < seg.endTime,
    );
  }, [subtitlesData?.segments, position]);

  if (playerError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{playerError}</Text>
        <Text style={styles.retryText} onPress={handleBack}>
          Go back
        </Text>
      </View>
    );
  }

  if (!currentAudiobook) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>No audiobook selected.</Text>
      </View>
    );
  }

  const progress = duration > 0 ? position / duration : 0;
  const elapsed = formatTime(position);
  const remaining = duration > 0 ? `${formatTime(duration - position)} left` : '--:--';

  const currentCoverImage =
    audiobookId === currentAudiobook.id ? signedUrls?.coverImage : null;
  const currentCoverVideo =
    audiobookId === currentAudiobook.id ? signedUrls?.coverVideo : null;

  return (
    <View style={styles.container}>
      <ShaderBackground
        imageSource={
          currentCoverImage
            ? { uri: currentCoverImage }
            : require('../../assets/images/cover.png')
        }
      />
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <TopBar onBack={handleBack} />

        <View style={styles.coverContainer}>
          {isLoadingState && !isReady ? (
            <View style={styles.coverLoading}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          ) : (
            <CoverArt
              imageUri={currentCoverImage || undefined}
              source={
                !currentCoverImage ? require('../../assets/images/cover.png') : undefined
              }
              videoUri={currentCoverVideo || undefined}
            />
          )}
        </View>

        <TrackInfo
          title={currentAudiobook.title}
          author={currentAudiobook.author?.name || 'Unknown author'}
        />

        <View style={styles.subtitlesContainer}>
          {subtitlesData?.segments && subtitlesData.segments.length > 0 && (
            <Subtitles segments={subtitlesData.segments} currentTime={position} />
          )}
        </View>

        <View style={styles.controlsArea}>
          {isLoadingState && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.85)" />
              <Text style={styles.loadingText}>Loading audio…</Text>
            </View>
          )}
          <ProgressBar
            progress={progress}
            elapsed={elapsed}
            remaining={remaining}
            duration={duration}
            chapters={chapters}
            onSeek={handleSeek}
          />
          <PlayerControls
            isPlaying={isPlaying}
            isActive={isAudioActive}
            onPlayPause={togglePlayPause}
            onSkipBack={() => skipBackward(15)}
            onSkipForward={() => skipForward(15)}
            disabled={!isReady}
          />
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { space, radius, fonts } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0E1014',
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      paddingHorizontal: space.xl,
    },
    coverContainer: {
      flexShrink: 1,
      justifyContent: 'center',
      marginBottom: space.xl,
    },
    coverLoading: {
      aspectRatio: 1,
      maxHeight: 280,
      alignSelf: 'center',
      width: '70%',
      borderRadius: radius.lg,
      backgroundColor: 'rgba(255,255,255,0.06)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    subtitlesContainer: {
      flex: 1,
      minHeight: 60,
      marginTop: space.md,
      marginBottom: space.md,
    },
    controlsArea: {
      paddingTop: space.xs,
    },
    loadingOverlay: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: space.md,
    },
    loadingText: {
      marginLeft: space.xs,
      color: 'rgba(255,255,255,0.78)',
      fontSize: 13,
      fontFamily: fonts.body.regular,
      letterSpacing: 0.2,
    },
    errorText: {
      color: 'rgba(255,255,255,0.85)',
      fontFamily: fonts.body.regular,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: space.md,
    },
    retryText: {
      color: '#FFFFFF',
      fontFamily: fonts.body.medium,
      fontSize: 15,
      textDecorationLine: 'underline',
    },
  });
}
