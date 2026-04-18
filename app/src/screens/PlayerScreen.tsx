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
import { Colors } from '../constants';
import { useAppSelector, useAppDispatch, useSubtitles, useAudioPlayer, useAudiobook } from '../hooks';
import { clearPlayer } from '../store/playerSlice';

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

  const handleSeek = useCallback((prog: number, shouldPlay = false) => {
    if (duration > 0) {
      seekTo(prog * duration);
      if (shouldPlay && !isPlaying) {
        togglePlayPause();
      }
    }
  }, [duration, isPlaying, seekTo, togglePlayPause]);

  // Determine loading state
  const isLoadingState = playerStatus === "loading" || audioLoading;

  const handleBack = useCallback(async () => {
    await saveProgress();
    if (onClose) {
      onClose();
    } else {
      dispatch(clearPlayer());
    }
  }, [dispatch, saveProgress, onClose]);

  // Render error state
  if (playerError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{playerError}</Text>
        <Text style={styles.retryText} onPress={handleBack}>Go Back</Text>
      </View>
    );
  }

  // Render no audiobook state
  if (!currentAudiobook) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>No audiobook selected</Text>
      </View>
    );
  }

  const progress = duration > 0 ? position / duration : 0;
  const elapsed = formatTime(position);
  const remaining = duration > 0 ? `${formatTime(duration - position)} left` : '--:--';

  // Check if there's active speech
  const isAudioActive = useMemo(() => {
    if (!subtitlesData?.segments) return true;
    return subtitlesData.segments.some(
      (seg) => position >= seg.startTime - 0.3 && position < seg.endTime
    );
  }, [subtitlesData?.segments, position]);

  // Get current cover - only show if URLs match current audiobook
  const currentCoverImage = audiobookId === currentAudiobook.id 
    ? signedUrls?.coverImage 
    : null;
  const currentCoverVideo = audiobookId === currentAudiobook.id 
    ? signedUrls?.coverVideo 
    : null;

  return (
    <View style={styles.container}>
      <ShaderBackground 
        imageSource={currentCoverImage ? { uri: currentCoverImage } : require('../../assets/images/cover.png')} 
      />
      <View style={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}>
        <TopBar onBack={handleBack} />
        
        <View style={styles.coverContainer}>
          {isLoadingState && !isReady ? (
            <View style={styles.coverLoading}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            <CoverArt
              imageUri={currentCoverImage || undefined}
              source={!currentCoverImage ? require('../../assets/images/cover.png') : undefined}
              videoUri={currentCoverVideo || undefined}
            />
          )}
        </View>
        
        <TrackInfo 
          title={currentAudiobook.title} 
          author={currentAudiobook.author?.name || 'Unknown Author'}
        />
        
        <View style={styles.subtitlesContainer}>
          {subtitlesData?.segments && subtitlesData.segments.length > 0 && (
            <Subtitles segments={subtitlesData.segments} currentTime={position} />
          )}
        </View>
        
        <View style={styles.controlsArea}>
          {isLoadingState && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading audio...</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  coverContainer: {
    flexShrink: 1,
    justifyContent: 'center',
    marginBottom: 24,
  },
  coverLoading: {
    aspectRatio: 1,
    maxHeight: 280,
    alignSelf: 'center',
    width: '70%',
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitlesContainer: {
    flex: 1,
    minHeight: 60,
    marginTop: 16,
    marginBottom: 16,
  },
  controlsArea: {
    paddingTop: 8,
  },
  loadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: Colors.secondary,
    fontSize: 14,
  },
  errorText: {
    color: Colors.secondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    color: Colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
