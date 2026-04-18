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
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";

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

function getBookColor(title: string): string {
  const colors = [
    "#1a1a2e", "#16213e", "#0f3460", "#533483",
    "#4a1942", "#2d132c", "#1e3a5f", "#3d2645",
  ];
  return colors[title.charCodeAt(0) % colors.length];
}

const SearchResultCard = memo(function SearchResultCard({
  audiobook,
  onPlay,
}: {
  audiobook: Audiobook;
  onPlay: () => void;
}) {
  const durationMinutes = Math.round(audiobook.totalDuration / 60);
  const bgColor = getBookColor(audiobook.title);

  return (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={onPlay}
      activeOpacity={0.8}
    >
      <View style={[styles.resultCover, { backgroundColor: bgColor }]}>
        <Text style={styles.resultInitial} numberOfLines={2}>
          {audiobook.title.slice(0, 20)}
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
          <Clock size={12} color="#999" />
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
        <Play size={16} color="#fff" fill="#fff" />
      </View>
    </TouchableOpacity>
  );
});

export function SearchScreen() {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const { data: catalogueData, isLoading } = useCatalogue();
  const { data: preferences } = useUserPreferences();
  const addToLibrary = useAddToLibrary();
  
  // Personalize popular searches based on user's interests
  const popularSearches = useMemo(() => {
    if (preferences?.genres && preferences.genres.length > 0) {
      const userGenreNames = preferences.genres
        .map((id: string) => GENRE_ID_TO_NAME[id])
        .filter(Boolean);
      // Mix user interests with general popular searches
      const personalized = [...new Set([...userGenreNames.slice(0, 3), ...DEFAULT_POPULAR_SEARCHES])];
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
          // Search results start from beginning (no saved position)
          dispatch(setAudiobook({ audiobook, startPosition: 0 }));
          dispatch(play());
        },
      });
    },
    [dispatch, addToLibrary]
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
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <View
          style={[styles.searchBar, isFocused && styles.searchBarFocused]}
        >
          <Search size={20} color="#999" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books, authors, topics..."
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color="#999" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : showResults ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SearchResultCard
              audiobook={item}
              onPlay={() => handlePlay(item)}
            />
          )}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.emptyResults}>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>
                Try different keywords or browse categories
              </Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsSection}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={18} color="#000" strokeWidth={2} />
              <Text style={styles.sectionTitle}>
                {preferences?.genres?.length ? "Suggested for You" : "Popular Searches"}
              </Text>
            </View>
            <View style={styles.popularTags}>
              {popularSearches.map((term) => (
                <TouchableOpacity
                  key={term}
                  style={styles.popularTag}
                  onPress={() => handlePopularSearch(term)}
                >
                  <Text style={styles.popularTagText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  searchBarFocused: {
    borderColor: "#000",
    backgroundColor: "#fff",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: "#000",
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
    paddingHorizontal: 20,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 14,
  },
  resultCover: {
    width: 56,
    height: 56,
    borderRadius: 8,
    padding: 6,
    justifyContent: "center",
  },
  resultInitial: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: "#fff",
    lineHeight: 13,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: "#000",
    marginBottom: 2,
  },
  resultAuthor: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#666",
    marginBottom: 4,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resultDuration: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#999",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  resultGenre: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#999",
  },
  playButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 2,
  },
  emptyResults: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: "#000",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#888",
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  suggestionsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "#000",
  },
  popularTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  popularTag: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  popularTagText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: "#000",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  categoryCard: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: "#fff",
  },
});
