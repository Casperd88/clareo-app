import React, { useState, useMemo, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, X, Play, Clock, TrendingUp } from "lucide-react-native";
import Fuse from "fuse.js";
import {
  useCatalogue,
  useAddToLibrary,
  useAppDispatch,
  useUserPreferences,
} from "../hooks";
import type { Audiobook } from "../types";
import { setAudiobook, play } from "../store/playerSlice";
import { useTheme, pickAccent } from "../theme";
import type { AppTheme } from "../theme";

const DEFAULT_POPULAR_SEARCHES = [
  "Atomic Habits",
  "Psychology",
  "Leadership",
  "Productivity",
  "Money",
  "Communication",
];

const GENRE_ID_TO_NAME: Record<string, string> = {
  "personal-development": "Personal Development",
  productivity: "Productivity",
  business: "Business",
  psychology: "Psychology",
  money: "Money",
  leadership: "Leadership",
  health: "Health",
  communication: "Communication",
  relationships: "Relationships",
  career: "Career",
  creativity: "Creativity",
  science: "Science",
  philosophy: "Philosophy",
  history: "History",
  parenting: "Parenting",
};

interface SearchResultCardProps {
  audiobook: Audiobook;
  onPlay: () => void;
  theme: AppTheme;
  styles: ReturnType<typeof createStyles>;
}

const SearchResultCard = memo(function SearchResultCard({
  audiobook,
  onPlay,
  theme,
  styles,
}: SearchResultCardProps) {
  const durationMinutes = Math.round(audiobook.totalDuration / 60);
  const accent = pickAccent(audiobook.id ?? audiobook.title);

  return (
    <TouchableOpacity style={styles.resultCard} onPress={onPlay} activeOpacity={0.85}>
      <View style={[styles.resultCover, { backgroundColor: accent }]}>
        <Text style={styles.resultInitial} numberOfLines={3}>
          {audiobook.title}
        </Text>
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={2}>
          {audiobook.title}
        </Text>
        <Text style={styles.resultAuthor} numberOfLines={1}>
          {audiobook.author?.name}
        </Text>
        <View style={styles.resultMeta}>
          <Clock size={12} color={theme.colors.tertiary} />
          <Text style={styles.resultDuration}>{durationMinutes} min</Text>
          {audiobook.genres?.[0] && (
            <>
              <View style={styles.dot} />
              <Text style={styles.resultGenre}>{audiobook.genres[0].name}</Text>
            </>
          )}
        </View>
      </View>
      <View style={styles.playButtonSmall}>
        <Play size={14} color={theme.colors.primaryInverse} fill={theme.colors.primaryInverse} />
      </View>
    </TouchableOpacity>
  );
});

export function SearchScreen() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const { data: catalogueData, isLoading } = useCatalogue();
  const { data: preferences } = useUserPreferences();
  const addToLibrary = useAddToLibrary();

  const popularSearches = useMemo(() => {
    if (preferences?.genres && preferences.genres.length > 0) {
      const userGenreNames = preferences.genres
        .map((id: string) => GENRE_ID_TO_NAME[id])
        .filter(Boolean);
      const personalized = [
        ...new Set([...userGenreNames.slice(0, 3), ...DEFAULT_POPULAR_SEARCHES]),
      ];
      return personalized.slice(0, 6);
    }
    return DEFAULT_POPULAR_SEARCHES;
  }, [preferences?.genres]);

  const fuse = useMemo(() => {
    if (!catalogueData?.audiobooks) return null;
    return new Fuse(catalogueData.audiobooks, {
      keys: [
        { name: "title", weight: 0.4 },
        { name: "author.name", weight: 0.3 },
        { name: "genres.name", weight: 0.2 },
        { name: "description", weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
    });
  }, [catalogueData?.audiobooks]);

  const searchResults = useMemo(() => {
    if (!query.trim() || !fuse) return [];
    return fuse.search(query).slice(0, 20).map((result) => result.item);
  }, [query, fuse]);

  const handlePlay = useCallback(
    (audiobook: Audiobook) => {
      addToLibrary.mutate(audiobook.id, {
        onSettled: () => {
          dispatch(setAudiobook({ audiobook, startPosition: 0 }));
          dispatch(play());
        },
      });
    },
    [dispatch, addToLibrary],
  );

  const handlePopularSearch = (term: string) => {
    setQuery(term);
  };

  const clearSearch = () => {
    setQuery("");
    Keyboard.dismiss();
  };

  const showResults = query.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Find your next listen</Text>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <Search size={18} color={theme.colors.tertiary} strokeWidth={1.8} />
          <TextInput
            style={styles.searchInput}
            placeholder="Books, authors, ideas…"
            placeholderTextColor={theme.colors.tertiary}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={16} color={theme.colors.tertiary} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : showResults ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SearchResultCard
              audiobook={item}
              onPlay={() => handlePlay(item)}
              theme={theme}
              styles={styles}
            />
          )}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.emptyResults}>
              <Text style={styles.emptyTitle}>Nothing found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different keyword, or browse the categories below.
              </Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsSection}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={16} color={theme.colors.primary} strokeWidth={1.8} />
              <Text style={styles.sectionTitle}>
                {preferences?.genres?.length ? "Suggested for you" : "Popular searches"}
              </Text>
            </View>
            <View style={styles.popularTags}>
              {popularSearches.map((term) => (
                <TouchableOpacity
                  key={term}
                  style={styles.popularTag}
                  onPress={() => handlePopularSearch(term)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.popularTagText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionTitle}>Browse by category</Text>
            <View style={styles.categoryGrid}>
              {[
                "Personal Development",
                "Business",
                "Psychology",
                "Productivity",
                "Money & Finance",
                "Leadership",
              ].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryCard}
                  onPress={() => handlePopularSearch(category)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.categoryText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
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
    header: {
      paddingHorizontal: space.xl,
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
      fontStyle: "italic",
      fontSize: 36,
      lineHeight: 40,
      color: colors.primary,
      letterSpacing: -0.4,
    },
    searchContainer: {
      paddingHorizontal: space.xl,
      marginBottom: space.md,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      paddingHorizontal: space.md,
      height: 48,
      gap: space.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchBarFocused: {
      borderColor: colors.primary,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      fontFamily: fonts.body.regular,
      color: colors.primary,
    },
    clearButton: {
      padding: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    resultsList: {
      paddingHorizontal: space.xl,
    },
    resultCard: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: space.sm + 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: space.sm + 4,
    },
    resultCover: {
      width: 56,
      height: 56,
      borderRadius: radius.md,
      padding: space.xs + 2,
      justifyContent: "flex-end",
    },
    resultInitial: {
      fontFamily: fonts.display.regular,
      color: "#FFFFFF",
      fontSize: 11,
      lineHeight: 13,
      letterSpacing: -0.2,
    },
    resultInfo: {
      flex: 1,
    },
    resultTitle: {
      ...type.body,
      fontFamily: fonts.body.medium,
      fontSize: 15,
      lineHeight: 20,
      color: colors.primary,
      marginBottom: 2,
    },
    resultAuthor: {
      ...type.bodySmall,
      color: colors.secondary,
      marginBottom: 4,
    },
    resultMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    resultDuration: {
      ...type.caption,
      color: colors.tertiary,
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: colors.quaternary,
      marginHorizontal: 4,
    },
    resultGenre: {
      ...type.caption,
      color: colors.tertiary,
    },
    playButtonSmall: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      paddingLeft: 2,
      ...shadows.tile.native,
    },
    emptyResults: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 60,
    },
    emptyTitle: {
      ...type.sectionLabel,
      fontFamily: fonts.body.medium,
      color: colors.primary,
      marginBottom: 8,
    },
    emptySubtitle: {
      ...type.bodySmall,
      color: colors.secondary,
      textAlign: "center",
      paddingHorizontal: space.xl,
    },
    suggestionsContainer: {
      flex: 1,
      paddingHorizontal: space.xl,
    },
    suggestionsSection: {
      marginBottom: space.xxl,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: space.xs,
      marginBottom: space.md,
    },
    sectionTitle: {
      ...type.sectionLabel,
      fontFamily: fonts.body.medium,
      color: colors.primary,
    },
    popularTags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: space.xs + 2,
    },
    popularTag: {
      backgroundColor: colors.surface,
      paddingHorizontal: space.md,
      paddingVertical: space.sm,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
    },
    popularTagText: {
      ...type.bodySmall,
      fontFamily: fonts.body.medium,
      color: colors.primary,
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: space.xs + 2,
      marginTop: space.sm,
    },
    categoryCard: {
      backgroundColor: colors.primary,
      paddingHorizontal: space.md,
      paddingVertical: space.sm + 2,
      borderRadius: radius.lg,
    },
    categoryText: {
      ...type.bodySmall,
      fontFamily: fonts.body.medium,
      color: colors.primaryInverse,
    },
  });
}
