import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ViewStyle,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import type { LibraryItem } from "../types";
import { useSignedUrls, useAppDispatch } from "../hooks";
import { setAudiobook, setSignedUrls } from "../store/playerSlice";
import { useTheme, pickAccent } from "../theme";
import type { AppTheme } from "../theme";

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
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { audiobook, playbackState } = item;
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<Video>(null);

  const { data: signedUrls } = useSignedUrls(audiobook.id, isHovered);

  const coverHeight = width * 1.1;
  const accent = pickAccent(audiobook.id ?? audiobook.title);

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
          <LinearGradient
            colors={[accent, "rgba(0,0,0,0.55)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1.2 }}
            style={styles.placeholderCover}
          >
            <Text style={styles.placeholderEyebrow} numberOfLines={1}>
              {audiobook.author?.name?.split(" ").slice(-1)[0] ?? "Clareo"}
            </Text>
            <Text style={styles.placeholderTitle} numberOfLines={3}>
              {audiobook.title}
            </Text>
          </LinearGradient>
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

function createStyles(theme: AppTheme) {
  const { colors, type, space, radius, shadows, fonts } = theme;
  return StyleSheet.create({
    container: {
      borderRadius: radius.lg,
    },
    coverContainer: {
      borderRadius: radius.lg,
      overflow: "hidden",
      backgroundColor: colors.surfaceMuted,
      ...shadows.tile.native,
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
      justifyContent: "flex-end",
      padding: space.md,
    },
    placeholderEyebrow: {
      ...type.eyebrow,
      color: "rgba(255,255,255,0.7)",
      marginBottom: space.xs,
    },
    placeholderTitle: {
      fontFamily: fonts.display.regular,
      color: "#FFFFFF",
      fontSize: 22,
      lineHeight: 26,
      letterSpacing: -0.4,
    },
    progressContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
    progressBar: {
      height: "100%",
      backgroundColor: "#FFFFFF",
    },
    completedBadge: {
      position: "absolute",
      top: space.sm,
      right: space.sm,
      backgroundColor: "rgba(15, 16, 22, 0.7)",
      paddingHorizontal: space.sm,
      paddingVertical: 4,
      borderRadius: radius.pill,
    },
    completedText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontFamily: fonts.body.medium,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    infoContainer: {
      paddingTop: space.sm + 2,
      paddingHorizontal: 2,
    },
    title: {
      ...type.body,
      fontFamily: fonts.body.medium,
      fontSize: 14,
      lineHeight: 18,
      color: colors.primary,
    },
    author: {
      ...type.caption,
      color: colors.secondary,
      marginTop: 2,
    },
    duration: {
      ...type.caption,
      color: colors.tertiary,
      marginTop: 4,
    },
  });
}
