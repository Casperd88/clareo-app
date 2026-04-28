import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Play, Pause, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppSelector, useAppDispatch, useSignedUrls } from "../hooks";
import { clearPlayer, togglePlayback } from "../store/playerSlice";
import { useTheme, pickAccent } from "../theme";
import type { AppTheme } from "../theme";

const MINI_PLAYER_HEIGHT = 64;
const TAB_BAR_HEIGHT = 85;

export function MiniPlayer({ onExpand }: { onExpand: () => void }) {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { currentAudiobook, signedUrls, audiobookId, status, position, duration } =
    useAppSelector((state) => state.player);

  const { data: fetchedUrls } = useSignedUrls(
    currentAudiobook?.id || "",
    !!currentAudiobook,
  );

  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const progress = duration > 0 ? position / duration : 0;

  const handlePlayPause = useCallback(() => {
    if (!isLoading) {
      dispatch(togglePlayback());
    }
  }, [dispatch, isLoading]);

  const handleClose = useCallback(() => {
    dispatch(clearPlayer());
  }, [dispatch]);

  if (!currentAudiobook) return null;

  const remainingSeconds = Math.max(0, duration - position);
  const remainingMinutes = Math.ceil(remainingSeconds / 60);
  const accent = pickAccent(currentAudiobook.id ?? currentAudiobook.title);

  const coverUrl =
    (audiobookId === currentAudiobook.id ? signedUrls?.coverImage : null) ||
    fetchedUrls?.urls?.coverImage;

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <TouchableOpacity style={styles.content} onPress={onExpand} activeOpacity={0.92}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.coverImage} />
        ) : (
          <LinearGradient
            colors={[accent, "rgba(0,0,0,0.55)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coverPlaceholder}
          >
            <Text style={styles.coverInitial}>
              {currentAudiobook.title[0]?.toUpperCase()}
            </Text>
          </LinearGradient>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentAudiobook.title}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            {isLoading ? (
              "Loading…"
            ) : (
              <>
                {currentAudiobook.author?.name}
                {remainingMinutes > 0 && duration > 0 && ` · ${remainingMinutes} min left`}
              </>
            )}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.playButton, isLoading && styles.playButtonLoading]}
            onPress={handlePlayPause}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : isPlaying ? (
              <Pause size={20} color={theme.colors.primary} fill={theme.colors.primary} />
            ) : (
              <Play size={20} color={theme.colors.primary} fill={theme.colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color={theme.colors.tertiary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, type, space, radius, shadows, fonts } = theme;
  return StyleSheet.create({
    container: {
      position: "absolute",
      bottom: TAB_BAR_HEIGHT,
      left: space.sm,
      right: space.sm,
      height: MINI_PLAYER_HEIGHT,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      ...shadows.floating.native,
    },
    progressBar: {
      height: 2,
      backgroundColor: colors.surfaceMuted,
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
    },
    content: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: space.sm,
      gap: space.sm,
    },
    coverImage: {
      width: 42,
      height: 42,
      borderRadius: radius.sm,
    },
    coverPlaceholder: {
      width: 42,
      height: 42,
      borderRadius: radius.sm,
      justifyContent: "center",
      alignItems: "center",
    },
    coverInitial: {
      fontFamily: fonts.display.regular,
      fontSize: 18,
      color: "#FFFFFF",
      letterSpacing: -0.4,
    },
    info: {
      flex: 1,
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
    controls: {
      flexDirection: "row",
      alignItems: "center",
      gap: space.xs,
    },
    playButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceMuted,
      justifyContent: "center",
      alignItems: "center",
    },
    playButtonLoading: {
      opacity: 0.7,
    },
    closeButton: {
      padding: space.xs,
    },
  });
}
