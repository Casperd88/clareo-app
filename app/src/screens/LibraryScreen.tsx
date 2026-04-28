import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Play, Plus } from "lucide-react-native";
import {
  useLibrary,
  useCatalogue,
  useAddToLibrary,
  useSignedUrls,
  useAppDispatch,
  useAppSelector,
} from "../hooks";
import type { Audiobook } from "../types";
import { logout } from "../store/authSlice";
import { setAudiobook } from "../store/playerSlice";
import { Logo } from "../components/Logo";
import { useTheme, pickAccent } from "../theme";
import type { AppTheme } from "../theme";

const { width } = Dimensions.get("window");
const CARD_GAP = 16;
const CARD_WIDTH = (width - 48) / 2;

interface CatalogueCardProps {
  audiobook: Audiobook;
  isInLibrary: boolean;
  onAdd: () => void;
  onPlay: () => void;
  isAdding: boolean;
  theme: AppTheme;
  styles: ReturnType<typeof createStyles>;
}

function CatalogueCard({
  audiobook,
  isInLibrary,
  onAdd,
  onPlay,
  isAdding,
  theme,
  styles,
}: CatalogueCardProps) {
  const { data: signedUrls, isLoading: urlsLoading } = useSignedUrls(audiobook.id);

  const coverUri = signedUrls?.urls?.coverImage;
  const accent = pickAccent(audiobook.id ?? audiobook.title);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={isInLibrary ? onPlay : onAdd}
      activeOpacity={0.85}
    >
      <View style={styles.coverShadow}>
        <View style={styles.coverContainer}>
          {urlsLoading ? (
            <View style={[styles.cover, styles.placeholderCover]}>
              <ActivityIndicator size="small" color={theme.colors.tertiary} />
            </View>
          ) : coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.cover} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={[accent, "#000000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1.2 }}
              style={[styles.cover, styles.placeholderCover]}
            >
              <Text style={styles.placeholderEyebrow} numberOfLines={1}>
                {audiobook.author?.name?.split(" ").slice(-1)[0] ?? "Clareo"}
              </Text>
              <Text style={styles.placeholderTitle} numberOfLines={3}>
                {audiobook.title}
              </Text>
            </LinearGradient>
          )}
          <View style={styles.overlay} />
          <View style={styles.actionContainer}>
            {isAdding ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : isInLibrary ? (
              <View style={styles.playButton}>
                <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
              </View>
            ) : (
              <View style={styles.addButton}>
                <Plus size={22} color={theme.colors.primaryInverse} strokeWidth={2} />
              </View>
            )}
          </View>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {audiobook.title}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {audiobook.author?.name || "Unknown author"}
      </Text>
    </TouchableOpacity>
  );
}

export function LibraryScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    data: libraryData,
    isLoading: libraryLoading,
    refetch: refetchLibrary,
    isRefetching: isRefetchingLibrary,
  } = useLibrary();

  const {
    data: catalogueData,
    isLoading: catalogueLoading,
    refetch: refetchCatalogue,
    isRefetching: isRefetchingCatalogue,
  } = useCatalogue();

  const addToLibrary = useAddToLibrary();

  const libraryIds = useMemo(
    () => new Set(libraryData?.library?.map((item) => item.audiobook.id) || []),
    [libraryData?.library],
  );

  const audiobooks = useMemo(
    () => catalogueData?.audiobooks || [],
    [catalogueData?.audiobooks],
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    refetchLibrary();
    refetchCatalogue();
  }, [refetchLibrary, refetchCatalogue]);

  const handleAdd = useCallback(
    (audiobookId: string) => {
      addToLibrary.mutate(audiobookId);
    },
    [addToLibrary],
  );

  const handlePlay = useCallback(
    (audiobook: Audiobook) => {
      dispatch(setAudiobook({ audiobook, startPosition: 0 }));
    },
    [dispatch],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Audiobook; index: number }) => (
      <View
        style={{
          width: CARD_WIDTH,
          marginLeft: index % 2 === 0 ? 0 : CARD_GAP,
          marginBottom: CARD_GAP,
        }}
      >
        <CatalogueCard
          audiobook={item}
          isInLibrary={libraryIds.has(item.id)}
          onAdd={() => handleAdd(item.id)}
          onPlay={() => handlePlay(item)}
          isAdding={addToLibrary.isPending && addToLibrary.variables === item.id}
          theme={theme}
          styles={styles}
        />
      </View>
    ),
    [
      libraryIds,
      handleAdd,
      handlePlay,
      addToLibrary.isPending,
      addToLibrary.variables,
      theme,
      styles,
    ],
  );

  const keyExtractor = useCallback((item: Audiobook) => item.id, []);

  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>Editorial library</Text>
            <Text style={styles.headerTitle}>Discover</Text>
            <Text style={styles.headerSubtitle}>
              {audiobooks.length} {audiobooks.length === 1 ? "title" : "titles"}, hand-picked
              for slow listening.
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.profileButton}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase() ||
                  "?"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [audiobooks.length, user, handleLogout, styles],
  );

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Logo width={56} color={theme.colors.quaternary} />
        <Text style={styles.emptyTitle}>Nothing here yet</Text>
        <Text style={styles.emptySubtitle}>New titles arrive every week.</Text>
      </View>
    ),
    [styles, theme.colors.quaternary],
  );

  const isLoading = libraryLoading || catalogueLoading;
  const isRefetching = isRefetchingLibrary || isRefetchingCatalogue;

  if (isLoading && !catalogueData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={audiobooks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
    loadingText: {
      color: colors.tertiary,
      fontSize: 14,
      marginTop: space.sm,
      fontFamily: fonts.body.regular,
    },
    listContent: {
      paddingHorizontal: space.md,
      paddingBottom: 120,
    },
    header: {
      marginBottom: space.xl,
      paddingHorizontal: space.xs,
      paddingTop: space.xs,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    eyebrow: {
      ...type.eyebrow,
      color: colors.tertiary,
      marginBottom: space.xs,
    },
    headerTitle: {
      fontFamily: fonts.display.italic,
      fontSize: 40,
      lineHeight: 44,
      color: colors.primary,
      letterSpacing: -0.6,
      fontStyle: "italic",
    },
    headerSubtitle: {
      ...type.body,
      color: colors.secondary,
      marginTop: space.xs,
      maxWidth: 320,
    },
    profileButton: {
      padding: 4,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatarText: {
      color: colors.primary,
      fontSize: 15,
      fontFamily: fonts.body.medium,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 100,
      gap: space.md,
    },
    emptyTitle: {
      ...type.title,
      fontSize: 22,
      lineHeight: 28,
      color: colors.primary,
    },
    emptySubtitle: {
      ...type.body,
      color: colors.secondary,
    },
    card: {
      width: "100%",
    },
    coverShadow: {
      aspectRatio: 0.78,
      borderRadius: radius.lg,
      marginBottom: space.sm,
      ...shadows.card.native,
    },
    coverContainer: {
      flex: 1,
      borderRadius: radius.lg,
      overflow: "hidden",
      backgroundColor: colors.surfaceMuted,
    },
    cover: {
      width: "100%",
      height: "100%",
    },
    placeholderCover: {
      justifyContent: "flex-end",
      alignItems: "flex-start",
      padding: space.md,
    },
    placeholderEyebrow: {
      fontFamily: fonts.body.medium,
      fontSize: 10,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.78)",
      marginBottom: space.xs,
    },
    placeholderTitle: {
      fontFamily: fonts.display.regular,
      fontSize: 18,
      lineHeight: 22,
      color: "#FFFFFF",
      letterSpacing: -0.2,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(15, 17, 22, 0.10)",
    },
    actionContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    playButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "rgba(15, 17, 22, 0.55)",
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 2,
      paddingLeft: 2,
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      ...shadows.floating.native,
    },
    title: {
      ...type.body,
      fontSize: 14,
      lineHeight: 18,
      color: colors.primary,
      marginBottom: 2,
      fontFamily: fonts.body.medium,
    },
    author: {
      ...type.bodySmall,
      color: colors.secondary,
      fontFamily: fonts.display.italic,
      fontStyle: "italic",
    },
  });
}
