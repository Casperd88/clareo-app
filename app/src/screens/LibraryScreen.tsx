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

const { width } = Dimensions.get("window");
const CARD_GAP = 16;
const CARD_WIDTH = (width - 48) / 2;

interface CatalogueCardProps {
  audiobook: Audiobook;
  isInLibrary: boolean;
  onAdd: () => void;
  onPlay: () => void;
  isAdding: boolean;
}

function CatalogueCard({
  audiobook,
  isInLibrary,
  onAdd,
  onPlay,
  isAdding,
}: CatalogueCardProps) {
  const { data: signedUrls, isLoading: urlsLoading } = useSignedUrls(audiobook.id);

  const coverUri = signedUrls?.urls?.coverImage;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={isInLibrary ? onPlay : onAdd}
      activeOpacity={0.8}
    >
      <View style={styles.coverShadow}>
        <View style={styles.coverContainer}>
          {urlsLoading ? (
            <View style={[styles.cover, styles.placeholderCover]}>
              <ActivityIndicator size="small" color="#ccc" />
            </View>
          ) : coverUri ? (
            <Image
              source={{ uri: coverUri }}
              style={styles.cover}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cover, styles.placeholderCover]}>
              <Logo width={40} color="#ccc" />
            </View>
          )}
          <View style={styles.overlay} />
          <View style={styles.playButtonContainer}>
            {isAdding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : isInLibrary ? (
              <View style={styles.playButton}>
                <Play size={20} color="#fff" fill="#fff" />
              </View>
            ) : (
              <View style={styles.addButton}>
                <Plus size={24} color="#fff" strokeWidth={2} />
              </View>
            )}
          </View>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {audiobook.title}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {audiobook.author?.name || "Unknown Author"}
      </Text>
    </TouchableOpacity>
  );
}

export function LibraryScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

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
    [libraryData?.library]
  );

  const audiobooks = useMemo(
    () => catalogueData?.audiobooks || [],
    [catalogueData?.audiobooks]
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
    [addToLibrary]
  );

  const handlePlay = useCallback(
    (audiobook: Audiobook) => {
      // Catalogue view starts from beginning (no saved position)
      dispatch(setAudiobook({ audiobook, startPosition: 0 }));
    },
    [dispatch]
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
        />
      </View>
    ),
    [libraryIds, handleAdd, handlePlay, addToLibrary.isPending, addToLibrary.variables]
  );

  const keyExtractor = useCallback((item: Audiobook) => item.id, []);

  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Discover</Text>
            <Text style={styles.headerSubtitle}>
              {audiobooks.length} {audiobooks.length === 1 ? "audiobook" : "audiobooks"}
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
    [audiobooks.length, user, handleLogout]
  );

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Logo width={60} color="#ccc" />
        <Text style={styles.emptyTitle}>No Audiobooks Yet</Text>
        <Text style={styles.emptySubtitle}>Check back later for new titles</Text>
      </View>
    ),
    []
  );

  const isLoading = libraryLoading || catalogueLoading;
  const isRefetching = isRefetchingLibrary || isRefetchingCatalogue;

  if (isLoading && !catalogueData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading...</Text>
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
            tintColor="#000"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#888",
    fontSize: 16,
    marginTop: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#000",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#888",
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#888",
  },
  card: {
    width: "100%",
  },
  coverShadow: {
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  coverContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  placeholderCover: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  playButtonContainer: {
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 2,
    paddingLeft: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  author: {
    fontSize: 13,
    color: "#888",
  },
});
