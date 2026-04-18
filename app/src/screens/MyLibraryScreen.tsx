import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Play, Clock, BookOpen, Trash2 } from "lucide-react-native";
import {
  useLibrary,
  useRemoveFromLibrary,
  useSignedUrls,
  useAppDispatch,
} from "../hooks";
import type { Audiobook, LibraryItem } from "../types";
import { setAudiobook } from "../store/playerSlice";
import { Logo } from "../components/Logo";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function getGradientColors(title: string): [string, string] {
  const gradients: [string, string][] = [
    ["#667eea", "#764ba2"],
    ["#f093fb", "#f5576c"],
    ["#4facfe", "#00f2fe"],
    ["#43e97b", "#38f9d7"],
    ["#fa709a", "#fee140"],
  ];
  const index = title.charCodeAt(0) % gradients.length;
  return gradients[index];
}

function LibraryCard({
  item,
  onPlay,
  onRemove,
  isRemoving,
}: {
  item: LibraryItem;
  onPlay: () => void;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  const { audiobook } = item;
  const { data: signedUrls } = useSignedUrls(audiobook.id);
  const coverUri = signedUrls?.urls?.coverImage;
  const durationMinutes = Math.round(audiobook.totalDuration / 60);
  const progress = item.playbackState
    ? Math.round(
        (item.playbackState.currentPosition / audiobook.totalDuration) * 100
      )
    : 0;

  return (
    <TouchableOpacity
      style={styles.libraryCard}
      onPress={onPlay}
      activeOpacity={0.8}
    >
      <View style={styles.cardCoverContainer}>
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.cardCover} />
        ) : (
          <LinearGradient
            colors={getGradientColors(audiobook.title)}
            style={[styles.cardCover, styles.cardGradient]}
          >
            <Text style={styles.cardInitial}>
              {audiobook.title[0]?.toUpperCase()}
            </Text>
          </LinearGradient>
        )}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Play size={20} color="#fff" fill="#fff" />
          </View>
        </View>
        {progress > 0 && progress < 100 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        )}
        {progress >= 100 && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {audiobook.title}
        </Text>
        <Text style={styles.cardAuthor} numberOfLines={1}>
          {audiobook.author?.name}
        </Text>
        <View style={styles.cardMeta}>
          <Clock size={12} color="#999" />
          <Text style={styles.cardDuration}>{durationMinutes} min</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={onRemove}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {isRemoving ? (
          <ActivityIndicator size="small" color="#999" />
        ) : (
          <Trash2 size={18} color="#999" strokeWidth={1.5} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export function MyLibraryScreen() {
  const dispatch = useAppDispatch();

  const {
    data: libraryData,
    isLoading,
    refetch,
    isRefetching,
  } = useLibrary();

  const removeFromLibrary = useRemoveFromLibrary();

  const libraryItems = useMemo(
    () => libraryData?.library || [],
    [libraryData?.library]
  );

  const inProgressItems = useMemo(
    () =>
      libraryItems.filter(
        (item) =>
          item.playbackState &&
          item.playbackState.currentPosition > 0 &&
          !item.playbackState.isCompleted
      ),
    [libraryItems]
  );

  const completedItems = useMemo(
    () => libraryItems.filter((item) => item.playbackState?.isCompleted),
    [libraryItems]
  );

  const notStartedItems = useMemo(
    () =>
      libraryItems.filter(
        (item) => !item.playbackState || item.playbackState.currentPosition === 0
      ),
    [libraryItems]
  );

  const handlePlay = useCallback(
    (audiobook: Audiobook, startPosition?: number) => {
      dispatch(setAudiobook({ audiobook, startPosition }));
    },
    [dispatch]
  );

  const handleRemove = useCallback(
    (audiobookId: string) => {
      removeFromLibrary.mutate(audiobookId);
    },
    [removeFromLibrary]
  );

  if (isLoading && !libraryData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  const renderSection = (title: string, items: LibraryItem[]) => {
    if (items.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map((item) => (
          <LibraryCard
            key={item.id}
            item={item}
            onPlay={() => handlePlay(item.audiobook, item.playbackState?.currentPosition)}
            onRemove={() => handleRemove(item.audiobook.id)}
            isRemoving={
              removeFromLibrary.isPending &&
              removeFromLibrary.variables === item.audiobook.id
            }
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Library</Text>
        <Text style={styles.subtitle}>
          {libraryItems.length} {libraryItems.length === 1 ? "book" : "books"}
        </Text>
      </View>

      {libraryItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <BookOpen size={64} color="#ddd" strokeWidth={1} />
          <Text style={styles.emptyTitle}>Your library is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add books from Discover or Search to start your collection
          </Text>
        </View>
      ) : (
        <FlatList
          data={[1]}
          keyExtractor={() => "sections"}
          renderItem={() => (
            <>
              {renderSection("Continue Listening", inProgressItems)}
              {renderSection("Up Next", notStartedItems)}
              {renderSection("Finished", completedItems)}
            </>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#000"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 36,
    fontFamily: Fonts.serifItalic,
    color: "#000",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: "#888",
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "#000",
    marginBottom: 16,
  },
  libraryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 14,
  },
  cardCoverContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  cardCover: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    justifyContent: "center",
    alignItems: "center",
  },
  cardInitial: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: "#fff",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 2,
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent,
  },
  completedBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  completedText: {
    fontSize: 9,
    fontFamily: Fonts.medium,
    color: "#fff",
    textAlign: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: "#000",
    marginBottom: 4,
    lineHeight: 20,
  },
  cardAuthor: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#666",
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardDuration: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#999",
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: Fonts.medium,
    color: "#000",
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
  },
});
