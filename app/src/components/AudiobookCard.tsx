import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ViewStyle,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import type { LibraryItem } from "../types";
import { useSignedUrls, useAppDispatch } from "../hooks";
import { setAudiobook, setSignedUrls } from "../store/playerSlice";

interface AudiobookCardProps {
  item: LibraryItem;
  width: number;
  style?: ViewStyle;
  onPress?: () => void;
}

export function AudiobookCard({
  item,
  width,
  style,
  onPress,
}: AudiobookCardProps) {
  const dispatch = useAppDispatch();
  const { audiobook, playbackState } = item;
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<Video>(null);

  const { data: signedUrls } = useSignedUrls(audiobook.id, isHovered);

  const coverHeight = width * 1.1;

  const progress = playbackState
    ? (playbackState.currentPosition / audiobook.totalDuration) * 100
    : 0;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isHovered && signedUrls?.urls.coverVideo) {
      timeout = setTimeout(() => {
        setShowVideo(true);
      }, 300);
    } else {
      setShowVideo(false);
    }

    return () => clearTimeout(timeout);
  }, [isHovered, signedUrls?.urls.coverVideo]);

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.playAsync();
    }
  }, [showVideo]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Direct card press starts from beginning
      dispatch(setAudiobook({ audiobook, startPosition: 0 }));
      if (signedUrls?.urls) {
        dispatch(setSignedUrls(signedUrls.urls));
      }
    }
  };

  const handlePressIn = () => setIsHovered(true);
  const handlePressOut = () => setIsHovered(false);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, { width }, style]}
    >
      <View style={[styles.coverContainer, { height: coverHeight }]}>
        {signedUrls?.urls.coverImage ? (
          <Image
            source={{ uri: signedUrls.urls.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderCover}>
            <Text style={styles.placeholderText}>
              {audiobook.title.charAt(0)}
            </Text>
          </View>
        )}

        {showVideo && signedUrls?.urls.coverVideo && (
          <Video
            ref={videoRef}
            source={{ uri: signedUrls.urls.coverVideo }}
            style={styles.coverVideo}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted
            useNativeControls={false}
          />
        )}

        {progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        )}

        {playbackState?.isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>Finished</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {audiobook.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {audiobook.author.name}
        </Text>
        <Text style={styles.duration}>
          {formatDuration(audiobook.totalDuration)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
  },
  coverContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholderCover: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#444",
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#0A84FF",
  },
  completedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(52, 199, 89, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  infoContainer: {
    paddingTop: 10,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    lineHeight: 18,
  },
  author: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  duration: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },
});
