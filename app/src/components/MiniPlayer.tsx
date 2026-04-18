import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import { Play, Pause, X } from "lucide-react-native";
import { useAppSelector, useAppDispatch, useSignedUrls } from "../hooks";
import { clearPlayer, togglePlayback } from "../store/playerSlice";
import { Fonts } from "../constants/typography";
import { Colors } from "../constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MINI_PLAYER_HEIGHT = 64;
const TAB_BAR_HEIGHT = 85;

export function MiniPlayer({ onExpand }: { onExpand: () => void }) {
  const dispatch = useAppDispatch();
  const { currentAudiobook, signedUrls, audiobookId, status, position, duration } = useAppSelector((state) => state.player);
  
  // Fetch signed URLs for cover image independently
  const { data: fetchedUrls } = useSignedUrls(
    currentAudiobook?.id || '',
    !!currentAudiobook
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
  
  // Use player state URLs if available, otherwise use fetched URLs
  const coverUrl = (audiobookId === currentAudiobook.id ? signedUrls?.coverImage : null) 
    || fetchedUrls?.urls?.coverImage;

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      
      <TouchableOpacity
        style={styles.content}
        onPress={onExpand}
        activeOpacity={0.9}
      >
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverInitial}>
              {currentAudiobook.title[0]?.toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentAudiobook.title}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            {isLoading ? "Loading..." : (
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
              <ActivityIndicator size="small" color="#000" />
            ) : isPlaying ? (
              <Pause size={22} color="#000" fill="#000" />
            ) : (
              <Play size={22} color="#000" fill="#000" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color="#999" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT,
    left: 0,
    right: 0,
    height: MINI_PLAYER_HEIGHT,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  progressBar: {
    height: 2,
    backgroundColor: "#f0f0f0",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  coverImage: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  coverPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  coverInitial: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "#fff",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: "#000",
  },
  author: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#888",
    marginTop: 2,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonLoading: {
    opacity: 0.7,
  },
  closeButton: {
    padding: 8,
  },
});
