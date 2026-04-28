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
import { useTheme, pickAccent, palette } from "../theme";
import type { AppTheme } from "../theme";

function pickGradient(seed: string): [string, string] {
  // Two harmonious accents pulled from the brand palette, picked
  // deterministically by seed so the same book keeps the same gradient.
  const base = pickAccent(seed);
  const partners: Record<string, string> = {
    [palette.expressive.cobalt]: palette.expressive.iris,
    [palette.warm.terracotta]: palette.warm.ochre,
    [palette.cool.teal]: palette.cool.eucalyptus,
    [palette.deep.aubergine]: palette.expressive.plum,
    [palette.expressive.plum]: palette.expressive.rose,
    [palette.warm.ochre]: palette.warm.clay,
    [palette.cool.lagoon]: palette.cool.steel,
    [palette.deep.petrol]: palette.cool.teal,
    [palette.expressive.iris]: palette.deep.midnight,
    [palette.warm.clay]: palette.warm.terracotta,
    [palette.cool.eucalyptus]: palette.deep.forest,
    [palette.deep.forest]: palette.deep.moss,
  };
  return [base, partners[base] ?? palette.neutral.charcoal];
}

interface LibraryCardProps {
  item: LibraryItem;
  onPlay: () => void;
  onRemove: () => void;
  isRemoving: boolean;
  theme: AppTheme;
  styles: ReturnType<typeof createStyles>;
}

function LibraryCard({ item, onPlay, onRemove, isRemoving, theme, styles }: LibraryCardProps) {
  const { audiobook } = item;
  const { data: signedUrls } = useSignedUrls(audiobook.id);
  const coverUri = signedUrls?.urls?.coverImage;
  const durationMinutes = Math.round(audiobook.totalDuration / 60);
  const progress = item.playbackState
    ? Math.round((item.playbackState.currentPosition / audiobook.totalDuration) * 100)
    : 0;

  return (
    <TouchableOpacity style={styles.libraryCard} onPress={onPlay} activeOpacity={0.85}>
      <View style={styles.cardCoverContainer}>
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.cardCover} />
        ) : (
          <LinearGradient
            colors={pickGradient(audiobook.id ?? audiobook.title)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.cardCover, styles.cardGradient]}
          >
            <Text style={styles.cardInitial}>{audiobook.title[0]?.toUpperCase()}</Text>
          </LinearGradient>
        )}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        </View>
        {progress > 0 && progress < 100 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        )}
        {progress >= 100 && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>Finished</Text>
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
          <Clock size={12} color={theme.colors.tertiary} />
          <Text style={styles.cardDuration}>{durationMinutes} min</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={onRemove}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {isRemoving ? (
          <ActivityIndicator size="small" color={theme.colors.tertiary} />
        ) : (
          <Trash2 size={18} color={theme.colors.tertiary} strokeWidth={1.5} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export function MyLibraryScreen() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { data: libraryData, isLoading, refetch, isRefetching } = useLibrary();
  const removeFromLibrary = useRemoveFromLibrary();

  const libraryItems = useMemo(() => libraryData?.library || [], [libraryData?.library]);

  const inProgressItems = useMemo(
    () =>
      libraryItems.filter(
        (item) =>
          item.playbackState &&
          item.playbackState.currentPosition > 0 &&
          !item.playbackState.isCompleted,
      ),
    [libraryItems],
  );

  const completedItems = useMemo(
    () => libraryItems.filter((item) => item.playbackState?.isCompleted),
    [libraryItems],
  );

  const notStartedItems = useMemo(
    () =>
      libraryItems.filter(
        (item) => !item.playbackState || item.playbackState.currentPosition === 0,
      ),
    [libraryItems],
  );

  const handlePlay = useCallback(
    (audiobook: Audiobook, startPosition?: number) => {
      dispatch(setAudiobook({ audiobook, startPosition }));
    },
    [dispatch],
  );

  const handleRemove = useCallback(
    (audiobookId: string) => {
      removeFromLibrary.mutate(audiobookId);
    },
    [removeFromLibrary],
  );

  if (isLoading && !libraryData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
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
              removeFromLibrary.isPending && removeFromLibrary.variables === item.audiobook.id
            }
            theme={theme}
            styles={styles}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Your collection</Text>
        <Text style={styles.title}>My library</Text>
        <Text style={styles.subtitle}>
          {libraryItems.length} {libraryItems.length === 1 ? "title" : "titles"}
        </Text>
      </View>

      {libraryItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <BookOpen size={56} color={theme.colors.quaternary} strokeWidth={1.2} />
          <Text style={styles.emptyTitle}>Your shelf is empty</Text>
          <Text style={styles.emptySubtitle}>
            Browse Discover or Search to start a collection that grows with you.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[1]}
          keyExtractor={() => "sections"}
          renderItem={() => (
            <>
              {renderSection("Currently listening", inProgressItems)}
              {renderSection("Up next", notStartedItems)}
              {renderSection("Finished", completedItems)}
            </>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, type, space, radius, shadows, fonts } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      paddingHorizontal: space.lg,
      paddingTop: space.xs,
      paddingBottom: space.md,
    },
    eyebrow: {
      ...type.eyebrow,
      color: colors.tertiary,
      marginBottom: space.xs,
    },
    title: {
      fontFamily: fonts.display.italic,
      fontSize: 40,
      lineHeight: 44,
      color: colors.primary,
      letterSpacing: -0.6,
      fontStyle: "italic",
    },
    subtitle: {
      ...type.body,
      color: colors.secondary,
      marginTop: space.xxs,
    },
    listContent: {
      paddingHorizontal: space.lg,
      paddingBottom: 120,
    },
    section: {
      marginBottom: space.xxl,
    },
    sectionTitle: {
      ...type.eyebrow,
      color: colors.tertiary,
      marginBottom: space.md,
    },
    libraryCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: space.sm,
      marginBottom: space.sm,
      gap: space.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.tile.native,
    },
    cardCoverContainer: {
      width: 72,
      height: 72,
      borderRadius: radius.md,
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
      fontFamily: fonts.display.regular,
      fontSize: 28,
      color: "#FFFFFF",
      letterSpacing: -0.5,
    },
    playOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(15, 17, 22, 0.18)",
      justifyContent: "center",
      alignItems: "center",
    },
    playButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(15, 17, 22, 0.6)",
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
      backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    progressFill: {
      height: "100%",
      backgroundColor: "#FFFFFF",
    },
    completedBadge: {
      position: "absolute",
      bottom: 6,
      left: 6,
      right: 6,
      backgroundColor: "rgba(15, 17, 22, 0.7)",
      borderRadius: radius.sm,
      paddingVertical: 2,
      paddingHorizontal: 4,
    },
    completedText: {
      fontSize: 9,
      fontFamily: fonts.body.medium,
      color: "#FFFFFF",
      textAlign: "center",
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    cardInfo: {
      flex: 1,
    },
    cardTitle: {
      ...type.body,
      fontSize: 15,
      lineHeight: 20,
      color: colors.primary,
      marginBottom: 2,
      fontFamily: fonts.body.medium,
    },
    cardAuthor: {
      ...type.bodySmall,
      color: colors.secondary,
      marginBottom: space.xxs,
      fontFamily: fonts.display.italic,
      fontStyle: "italic",
    },
    cardMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    cardDuration: {
      ...type.caption,
      color: colors.tertiary,
    },
    removeButton: {
      padding: space.xs,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: space.xxl,
    },
    emptyTitle: {
      ...type.title,
      fontSize: 22,
      lineHeight: 28,
      color: colors.primary,
      marginTop: space.xl,
      marginBottom: space.xs,
    },
    emptySubtitle: {
      ...type.body,
      color: colors.secondary,
      textAlign: "center",
      maxWidth: 320,
    },
  });
}
