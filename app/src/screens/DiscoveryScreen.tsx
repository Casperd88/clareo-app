import React, { useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Play, Clock, Flame } from "lucide-react-native";
import {
  useDiscovery,
  useLibrary,
  useAddToLibrary,
  useSignedUrls,
  useUserStats,
  useAppDispatch,
  useAppSelector,
} from "../hooks";
import type { Audiobook } from "../types";
import type { DiscoverySection, DiscoveryAudiobook } from "../api";
import { setAudiobook, play } from "../store/playerSlice";
import { Logo } from "../components/Logo";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = 150;
const HERO_CARD_HEIGHT = 180;

function getBookColor(title: string): string {
  const colors = [
    "#1a1a2e", "#16213e", "#0f3460", "#533483",
    "#4a1942", "#2d132c", "#1e3a5f", "#3d2645",
    "#1c1c1c", "#2d3436", "#192a56", "#40407a",
  ];
  const index = title.charCodeAt(0) % colors.length;
  return colors[index];
}

interface ContentCardProps {
  audiobook: DiscoveryAudiobook;
  onPlay: () => void;
  showTrending?: boolean;
}

const ContentCard = memo(function ContentCard({
  audiobook,
  onPlay,
  showTrending,
}: ContentCardProps) {
  const durationMinutes = Math.round(audiobook.totalDuration / 60);
  const bgColor = getBookColor(audiobook.title);
  const coverUrl = audiobook.coverImageUrl;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPlay}
      activeOpacity={0.85}
    >
      {coverUrl ? (
        <View style={styles.cardCoverContainer}>
          <Image 
            source={{ uri: coverUrl }} 
            style={styles.cardCoverImage}
            resizeMode="cover"
          />
          {showTrending && (
            <View style={styles.trendingBadge}>
              <Flame size={10} color="#fff" fill="#fff" />
            </View>
          )}
          <View style={styles.playHintOverlay}>
            <Play size={16} color="#fff" fill="#fff" />
          </View>
        </View>
      ) : (
        <View style={[styles.cardCover, { backgroundColor: bgColor }]}>
          <Text style={styles.coverTitle} numberOfLines={3}>
            {audiobook.title}
          </Text>
          {showTrending && (
            <View style={styles.trendingBadge}>
              <Flame size={10} color="#fff" fill="#fff" />
            </View>
          )}
          <View style={styles.playHint}>
            <Play size={16} color="#fff" fill="#fff" />
          </View>
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardAuthor} numberOfLines={1}>
          {audiobook.author?.name}
        </Text>
        <View style={styles.cardMeta}>
          <Clock size={11} color="#999" />
          <Text style={styles.cardDuration}>{durationMinutes} min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

interface HeroCardProps {
  audiobook: DiscoveryAudiobook;
  onPlay: () => void;
  title: string;
  subtitle: string;
  progress?: number;
}

const HeroCard = memo(function HeroCard({
  audiobook,
  onPlay,
  title,
  subtitle,
  progress,
}: HeroCardProps) {
  const totalMinutes = Math.round(audiobook.totalDuration / 60);
  const bgColor = getBookColor(audiobook.title);
  const coverUrl = audiobook.coverImageUrl;
  
  // Calculate remaining time when there's progress
  const hasProgress = typeof progress === "number" && progress > 0;
  const remainingMinutes = hasProgress 
    ? Math.round((1 - progress) * audiobook.totalDuration / 60)
    : totalMinutes;
  const durationText = hasProgress ? `${remainingMinutes} min left` : `${totalMinutes} min`;

  const heroContent = (
    <>
      <View style={styles.heroContent}>
        <View style={styles.heroTextContent}>
          <Text style={styles.heroBookTitle} numberOfLines={2}>
            {audiobook.title}
          </Text>
          <Text style={styles.heroAuthor} numberOfLines={1}>
            {audiobook.author?.name}
          </Text>
          <View style={styles.heroDuration}>
            <Clock size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroDurationText}>{durationText}</Text>
          </View>
        </View>
        <View style={[styles.heroPlayButton, coverUrl && { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
          <Play size={28} color={coverUrl ? "#000" : bgColor} fill={coverUrl ? "#000" : bgColor} />
        </View>
      </View>
      {hasProgress && (
        <View style={styles.heroProgressContainer}>
          <View style={styles.heroProgress}>
            <View style={[styles.heroProgressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      )}
    </>
  );

  return (
    <View style={styles.heroSection}>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
      <TouchableOpacity
        style={styles.heroCard}
        onPress={onPlay}
        activeOpacity={0.9}
      >
        {coverUrl ? (
          <ImageBackground
            source={{ uri: coverUrl }}
            style={[styles.heroImageBg, { backgroundColor: bgColor }]}
            imageStyle={styles.heroImageStyle}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay}>
              {heroContent}
            </View>
          </ImageBackground>
        ) : (
          <View style={[styles.heroColorBg, { backgroundColor: bgColor }]}>
            {heroContent}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
});

function SectionHeader({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

export function DiscoveryScreen() {
  const dispatch = useAppDispatch();
  const onboardingData = useAppSelector((state) => state.onboarding.data);
  const currentAudiobook = useAppSelector((state) => state.player.currentAudiobook);
  const playerPosition = useAppSelector((state) => state.player.position);
  const playerDuration = useAppSelector((state) => state.player.duration);

  const { data: discoveryData, isLoading, refetch, isRefetching } = useDiscovery();
  const { data: libraryData } = useLibrary();
  const { data: stats } = useUserStats();
  const addToLibrary = useAddToLibrary();

  const lastPlayedItem = useMemo(() => {
    if (!libraryData?.library) return null;
    const inProgress = libraryData.library.find(
      (item) => item.playbackState && item.playbackState.currentPosition > 0 && !item.playbackState.isCompleted
    );
    return inProgress || null;
  }, [libraryData?.library]);

  // Fetch signed URLs for continue learning hero card
  const { data: continueListeningUrls } = useSignedUrls(
    lastPlayedItem?.audiobook.id || '',
    !!lastPlayedItem
  );

  const handlePlay = useCallback(
    (audiobook: Audiobook, startPosition?: number) => {
      addToLibrary.mutate(audiobook.id, {
        onSettled: () => {
          dispatch(setAudiobook({ audiobook, startPosition }));
          dispatch(play());
        },
      });
    },
    [dispatch, addToLibrary]
  );

  const renderSection = useCallback(
    (section: DiscoverySection) => {
      const isTrending = section.id === "trending";

      return (
        <View key={section.id} style={styles.section}>
          <SectionHeader
            title={isTrending ? "Trending Now" : section.title}
            subtitle={section.subtitle}
            icon={isTrending ? <Flame size={18} color={Colors.accent} fill={Colors.accent} style={{ marginRight: 6 }} /> : undefined}
          />
          <FlatList
            horizontal
            data={section.audiobooks}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <ContentCard
                audiobook={item}
                onPlay={() => handlePlay(item)}
                showTrending={isTrending}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        </View>
      );
    },
    [handlePlay]
  );

  if (isLoading && !discoveryData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Logo width={48} color="#000" />
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
        </View>
      </SafeAreaView>
    );
  }

  const displayName = onboardingData.displayName || "there";
  const forYouSection = discoveryData?.sections.find((s) => s.id === "for-you");
  const otherSections = discoveryData?.sections.filter((s) => s.id !== "for-you") || [];
  
  const heroAudiobook: DiscoveryAudiobook | undefined = lastPlayedItem?.audiobook 
    ? { ...lastPlayedItem.audiobook, coverImageUrl: continueListeningUrls?.urls?.coverImage || null }
    : forYouSection?.audiobooks[0];
  
  // Use real-time player position if this book is currently loaded, otherwise use cached library data
  const isCurrentlyPlaying = currentAudiobook?.id === lastPlayedItem?.audiobook.id;
  const heroProgress = lastPlayedItem?.playbackState
    ? isCurrentlyPlaying && playerDuration > 0
      ? playerPosition / playerDuration
      : lastPlayedItem.playbackState.currentPosition / lastPlayedItem.audiobook.totalDuration
    : undefined;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#000" />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {discoveryData?.greeting || `Good morning, ${displayName}`}
          </Text>
          {/* Goal progress: Show when user has data, hide for brand new users */}
          {stats && (stats.completedThisMonth > 0 || stats.inProgressCount > 0) ? (
            <View style={styles.goalBanner}>
              <View style={styles.goalBannerLeft}>
                <View style={styles.goalRing}>
                  <View style={styles.goalRingTrack} />
                  <View 
                    style={[
                      styles.goalRingProgress,
                      { 
                        transform: [{ rotate: '-90deg' }],
                      }
                    ]} 
                  >
                    <View 
                      style={[
                        styles.goalRingFill,
                        { 
                          borderTopColor: stats.completedThisMonth >= stats.monthlyGoal ? '#10b981' : '#000',
                          borderRightColor: stats.progressPercent >= 25 ? (stats.completedThisMonth >= stats.monthlyGoal ? '#10b981' : '#000') : 'transparent',
                          borderBottomColor: stats.progressPercent >= 50 ? (stats.completedThisMonth >= stats.monthlyGoal ? '#10b981' : '#000') : 'transparent',
                          borderLeftColor: stats.progressPercent >= 75 ? (stats.completedThisMonth >= stats.monthlyGoal ? '#10b981' : '#000') : 'transparent',
                        }
                      ]} 
                    />
                  </View>
                  <View style={styles.goalRingCenter}>
                    <Text style={styles.goalRingNumber}>{stats.completedThisMonth}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.goalBannerRight}>
                <Text style={styles.goalBannerTitle}>
                  {stats.completedThisMonth >= stats.monthlyGoal 
                    ? "Goal reached! 🎉" 
                    : `${stats.monthlyGoal - stats.completedThisMonth} more to go`}
                </Text>
                <Text style={styles.goalBannerSubtitle}>
                  {stats.completedThisMonth} of {stats.monthlyGoal} books this month
                </Text>
                {stats.partialProgress > 0 && stats.completedThisMonth < stats.monthlyGoal && (
                  <View style={styles.goalPartialRow}>
                    <View style={styles.goalPartialBar}>
                      <View 
                        style={[
                          styles.goalPartialFill, 
                          { width: `${Math.min(stats.partialProgress * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.goalPartialText}>
                      {Math.round(stats.partialProgress * 100)}% in progress
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ) : discoveryData?.meta?.isNewUser ? (
            <Text style={styles.welcomeSubtitle}>
              Start listening to begin your learning journey
            </Text>
          ) : null}
        </View>

        {heroAudiobook && (
          <HeroCard
            audiobook={heroAudiobook}
            onPlay={() => handlePlay(
              heroAudiobook, 
              lastPlayedItem?.playbackState?.currentPosition
            )}
            title={lastPlayedItem ? "Continue Learning" : "Start Here"}
            subtitle={lastPlayedItem ? "Pick up where you left off" : "Recommended for you"}
            progress={heroProgress}
          />
        )}

        {otherSections.map(renderSection)}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {discoveryData?.totalBooks || 0} titles available
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 140,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  greeting: {
    fontSize: 32,
    fontFamily: Fonts.serifItalic,
    color: "#000",
    letterSpacing: -0.3,
  },
  goalBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    gap: 14,
  },
  goalBannerLeft: {
    alignItems: "center",
    justifyContent: "center",
  },
  goalRing: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  goalRingTrack: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "#e5e5e5",
  },
  goalRingProgress: {
    position: "absolute",
    width: 48,
    height: 48,
  },
  goalRingFill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "transparent",
  },
  goalRingCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  goalRingNumber: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "#000",
  },
  goalBannerRight: {
    flex: 1,
  },
  goalBannerTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: "#000",
    marginBottom: 2,
  },
  goalBannerSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#666",
  },
  goalPartialRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  goalPartialBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e5e5e5",
    borderRadius: 2,
    overflow: "hidden",
  },
  goalPartialFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 2,
  },
  goalPartialText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: "#10b981",
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#888",
    marginTop: 4,
  },
  heroSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: "#000",
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#888",
    marginBottom: 14,
  },
  heroCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  heroImageBg: {
    minHeight: HERO_CARD_HEIGHT,
  },
  heroImageStyle: {
    borderRadius: 16,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  heroColorBg: {
    minHeight: HERO_CARD_HEIGHT,
  },
  heroContent: {
    flexDirection: "row",
    padding: 20,
    minHeight: HERO_CARD_HEIGHT,
    alignItems: "flex-end",
  },
  heroTextContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  heroBookTitle: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: "#fff",
    marginBottom: 8,
    lineHeight: 28,
  },
  heroAuthor: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 12,
  },
  heroDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroDurationText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: "rgba(255,255,255,0.8)",
  },
  heroPlayButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    marginLeft: 16,
    paddingLeft: 3,
  },
  heroProgressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  heroProgress: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  heroProgressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "#000",
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#888",
    marginTop: 3,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
  },
  cardCoverContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  cardCoverImage: {
    width: "100%",
    height: "100%",
  },
  playHintOverlay: {
    position: "absolute",
    bottom: 10,
    left: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 2,
  },
  cardCover: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 12,
    padding: 14,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  coverTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: "#fff",
    lineHeight: 20,
  },
  trendingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: Colors.accent,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  playHint: {
    alignSelf: "flex-start",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 2,
  },
  cardInfo: {
    gap: 2,
  },
  cardAuthor: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: "#000",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardDuration: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#888",
  },
  footer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#ccc",
  },
});
