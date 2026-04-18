import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ImageSourcePropType,
  Animated,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

const INTERVAL_MS = 8000;
const FADE_MS = 600;

interface CoverArtProps {
  source?: ImageSourcePropType;
  imageUri?: string;
  videoSource?: number;
  videoUri?: string;
}

export function CoverArt({ source, imageUri, videoSource, videoUri }: CoverArtProps) {
  const videoRef = useRef<Video>(null);
  const videoOpacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  const hasVideo = videoSource || videoUri;
  const imageSource = imageUri ? { uri: imageUri } : source;
  const videoSrc = videoUri ? { uri: videoUri } : videoSource;

  const fadeIn = useCallback(() => {
    Animated.timing(videoOpacity, {
      toValue: 1,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start();
  }, [videoOpacity]);

  const fadeOut = useCallback(() => {
    Animated.timing(videoOpacity, {
      toValue: 0,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start();
  }, [videoOpacity]);

  const playVideo = useCallback(async () => {
    if (!videoRef.current || !videoReady) return;
    try {
      await videoRef.current.setPositionAsync(0);
      fadeIn();
      await videoRef.current.playAsync();
    } catch { }
  }, [videoReady, fadeIn]);

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) {
        fadeOut();
        timerRef.current = setTimeout(playVideo, INTERVAL_MS);
      }
    },
    [fadeOut, playVideo],
  );

  useEffect(() => {
    if (videoReady) {
      playVideo();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [videoReady, playVideo]);

  useEffect(() => {
    setVideoReady(false);
    videoOpacity.setValue(0);
  }, [videoUri, videoSource]);

  return (
    <View style={styles.shadow}>
      <View style={styles.clip}>
        {imageSource && (
          <Image source={imageSource} style={styles.media} resizeMode="cover" />
        )}
        {hasVideo && videoSrc && (
          <Animated.View style={[styles.videoOverlay, { opacity: videoOpacity }]}>
            <Video
              ref={videoRef}
              source={videoSrc}
              style={styles.media}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isLooping={false}
              isMuted
              onLoad={() => setVideoReady(true)}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    width: '100%',
    maxWidth: 340,
    aspectRatio: 1,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 20,
    alignSelf: 'center',
    flexShrink: 1,
  },
  clip: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
