import React, { useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
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
import { useTheme, pickAccent } from "../theme";
import type { AppTheme } from "../theme";

const CARD_WIDTH = 152;
const HERO_CARD_HEIGHT = 220;

interface ContentCardProps {
  audiobook: DiscoveryAudiobook;
  onPlay: () => void;
  showTrending?: boolean;
  theme: AppTheme;
  styles: ReturnType<typeof createStyles>;
}

const ContentCard = memo(function ContentCard({
  audiobook,
  onPlay,
  showTrending,
  theme,
  styles,
}: ContentCardProps) {
  const durationMinutes = Math.round(audiobook.totalDuration / 60);
  const accent = pickAccent(audiobook.id ?? audiobook.title);
  const coverUrl = audiobook.coverImageUrl;

  return (
    <TouchableOpacity style={styles.card} onPress={onPlay} activeOpacity={0.85}>
      {coverUrl ? (
        <View style={styles.cardCoverContainer}>
          <Image source={{ uri: coverUrl }} style={styles.cardCoverImage} resizeMode="cover" />
          {showTrending && (
            <View style={styles.trendingBadge}>
              <Flame size={10} color={theme.colors.primaryInverse} fill={theme.colors.primaryInverse} />
            </View>
          )}
          <View style={styles.playHintOverlay}>
            <Play size={14} color="#fff" fill="#fff" />
          </View>
        </View>
      ) : (
        <View style={[styles.cardCover, { backgroundColor: accent }]}>
          <Text style={styles.coverEyebrow} numberOfLines={1}>
            {audiobook.author?.name?.split(" ").slice(-1)[0] ?? "Clareo"}
          </Text>
          <Text style={styles.coverTitle} numberOfLines={4}>
            {audiobook.title}
          </Text>
          {showTrending && (
            <View style={styles.trendingBadge}>
              <Flame size={10} color={theme.colors.primaryInverse} fill={theme.colors.primaryInverse} />
            </View>
          )}
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {audiobook.title}
        </Text>
        <Text style={styles.cardAuthor} numberOfLines={1}>
          {audiobook.author?.name}
        </Text>
        <View style={styles.cardMeta}>
          <Clock size={11} color={theme.colors.tertiary} />
          <Text style={styles.cardDuration}>{durationMinutes} min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

interface HeroCardProps {
  audiobook: DiscoveryAudiobook;
  onPlay: () => void;
  eyebrow: string;
  title: string;
  progress?: number;
  theme: AppTheme;
  styles: ReturnType<typeof createStyles>;
}

const HeroCard = memo(function HeroCard({
  audiobook,
  onPlay,
  eyebrow,
  title,
  progress,
  theme,
  styles,
}: HeroCardProps) {
  const totalMinutes = Math.round(audiobook.totalDuration / 60);
  const accent = pickAccent(audiobook.id ?? audiobook.title);
  const coverUrl = audiobook.coverImageUrl;

  const hasProgress = typeof progress === "number" && progress > 0;
  const remainingMinutes = hasProgress
    ? Math.round(((1 - progress) * audiobook.totalDuration) / 60)
    : totalMinutes;
  const durationText = hasProgress ? `${remainingMinutes} min left` : `${totalMinutes} min`;

  const heroBody = (
    <>
      <View style={styles.heroContent}>
        <View style={styles.heroTextContent}>
          <Text style={styles.heroEyebrow}>{eyebrow}</Text>
          <Text style={styles.heroBookTitle} numberOfLines={2}>
            {audiobook.title}
          </Text>
          <Text style={styles.heroAuthor} numberOfLines={1}>
            {audiobook.author?.name}
          </Text>
          <View style={styles.heroMetaRow}>
            <Clock size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.heroDurationText}>{durationText}</Text>
          </View>
        </View>
        <View style={styles.heroPlayButton}>
          <Play size={26} color={theme.colors.primary} fill={theme.colors.primary} />
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
      <Text style={styles.heroSectionLabel}>{title}</Text>
      <TouchableOpacity style={styles.heroCard} onPress={onPlay} activeOpacity={0.92}>
        {coverUrl ? (
          <ImageBackground
            source={{ uri: coverUrl }}
            style={[styles.heroImageBg, { backgroundColor: accent }]}
            imageStyle={styles.heroImageStyle}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay}>{heroBody}</View>
          </ImageBackground>
        ) : (
          <View style={[styles.heroColorBg, { backgroundColor: accent }]}>{heroBody}</View>
        )}
      </TouchableOpacity>
    </View>
  );
});

function SectionHeader({
  title,
  subtitle,
  icon,
  styles,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function DiscoveryScreen() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
      (item) =>
        item.playbackState &&
        item.playbackState.currentPosition > 0 &&
        !item.playbackState.isCompleted,
    );
    return inProgress || null;
  }, [libraryData?.library]);

  const { data: continueListeningUrls } = useSignedUrls(
    lastPlayedItem?.audiobook.id || "",
    !!lastPlayedItem,
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
    [dispatch, addToLibrary],
  );

  const renderSection = useCallback(
    (section: DiscoverySection) => {
      const isTrending = section.id === "trending";

      return (
        <View key={section.id} style={styles.section}>
          <SectionHeader
            title={isTrending ? "Trending now" : section.title}
            subtitle={section.subtitle}
            icon={
              isTrending ? (
                <Flame
                  size={16}
                  color={theme.colors.accentWarm}
                  fill={theme.colors.accentWarm}
                  style={{ marginRight: 6 }}
                />
              ) : undefined
            }
            styles={styles}
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
                theme={theme}
                styles={styles}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ width: theme.space.md }} />}
          />
        </View>
      );
    },
    [handlePlay, theme, styles],
  );

  if (isLoading && !discoveryData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Logo width={48} color={theme.colors.primary} />
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={{ marginTop: theme.space.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const displayName = onboardingData.displayName || "there";
  const forYouSection = discoveryData?.sections.find((s) => s.id === "for-you");
  const otherSections = discoveryData?.sections.filter((s) => s.id !== "for-you") || [];

  const heroAudiobook: DiscoveryAudiobook | undefined = lastPlayedItem?.audiobook
    ? {
        ...lastPlayedItem.audiobook,
        coverImageUrl: continueListeningUrls?.urls?.coverImage || null,
      }
    : forYouSection?.audiobooks[0];

  const isCurrentlyPlaying = currentAudiobook?.id === lastPlayedItem?.audiobook.id;
  const heroProgress = lastPlayedItem?.playbackState
    ? isCurrentlyPlaying && playerDuration > 0
      ? playerPosition / playerDuration
      : lastPlayedItem.playbackState.currentPosition / lastPlayedItem.audiobook.totalDuration
    : undefined;

  const hasGoalData = !!stats && (stats.completedThisMonth > 0 || stats.inProgressCount > 0);
  const goalReached = !!stats && stats.completedThisMonth >= stats.monthlyGoal;
  const goalProgressColor = goalReached ? theme.colors.success : theme.colors.primary;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Today, on Clareo</Text>
          <Text style={styles.greeting}>
            {discoveryData?.greeting || `Good morning, ${displayName}.`}
          </Text>

          {hasGoalData && stats ? (
            <View style={styles.goalBanner}>
              <View style={styles.goalBannerLeft}>
                <View style={styles.goalRing}>
                  <View style={styles.goalRingTrack} />
                  <View style={[styles.goalRingProgress, { transform: [{ rotate: "-90deg" }] }]}>
                    <View
                      style={[
                        styles.goalRingFill,
                        {
                          borderTopColor: goalProgressColor,
                          borderRightColor:
                            stats.progressPercent >= 25 ? goalProgressColor : "transparent",
                          borderBottomColor:
                            stats.progressPercent >= 50 ? goalProgressColor : "transparent",
                          borderLeftColor:
                            stats.progressPercent >= 75 ? goalProgressColor : "transparent",
                        },
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
                  {goalReached
                    ? "Goal reached"
                    : `${stats.monthlyGoal - stats.completedThisMonth} more to go`}
                </Text>
                <Text style={styles.goalBannerSubtitle}>
                  {stats.completedThisMonth} of {stats.monthlyGoal} books this month
                </Text>
                {stats.partialProgress > 0 && !goalReached && (
                  <View style={styles.goalPartialRow}>
                    <View style={styles.goalPartialBar}>
                      <View
                        style={[
                          styles.goalPartialFill,
                          { width: `${Math.min(stats.partialProgress * 100, 100)}%` },
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
              Start listening to begin your reading journey.
            </Text>
          ) : null}
        </View>

        {heroAudiobook && (
          <HeroCard
            audiobook={heroAudiobook}
            onPlay={() =>
              handlePlay(heroAudiobook, lastPlayedItem?.playbackState?.currentPosition)
            }
            eyebrow={lastPlayedItem ? "Currently listening" : "Editor’s pick"}
            title={lastPlayedItem ? "Continue where you left off" : "A title for today"}
            progress={heroProgress}
            theme={theme}
            styles={styles}
          />
        )}

        {otherSections.map(renderSection)}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {discoveryData?.totalBooks || 0} titles in the library
          </Text>
        </View>
      </ScrollView>
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
    scrollContent: {
      paddingBottom: 140,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      paddingHorizontal: space.lg,
      paddingTop: space.md,
      paddingBottom: space.xs,
    },
    eyebrow: {
      ...type.eyebrow,
      color: colors.tertiary,
      marginBottom: space.xs,
    },
    greeting: {
      fontFamily: fonts.display.italic,
      fontSize: 36,
      lineHeight: 40,
      color: colors.primary,
      letterSpacing: -0.6,
      fontStyle: "italic",
    },
    welcomeSubtitle: {
      ...type.body,
      color: colors.secondary,
      marginTop: space.sm,
    },
    goalBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: space.md,
      marginTop: space.lg,
      gap: space.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.tile.native,
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
      borderWidth: 3,
      borderColor: colors.surfaceMuted,
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
      borderWidth: 3,
      borderColor: "transparent",
    },
    goalRingCenter: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },
    goalRingNumber: {
      fontFamily: fonts.body.medium,
      fontSize: 17,
      color: colors.primary,
    },
    goalBannerRight: {
      flex: 1,
    },
    goalBannerTitle: {
      ...type.sectionLabel,
      color: colors.primary,
      marginBottom: 2,
    },
    goalBannerSubtitle: {
      ...type.bodySmall,
      color: colors.secondary,
    },
    goalPartialRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: space.xs + 2,
      gap: space.xs,
    },
    goalPartialBar: {
      flex: 1,
      height: 4,
      backgroundColor: colors.surfaceMuted,
      borderRadius: 2,
      overflow: "hidden",
    },
    goalPartialFill: {
      height: "100%",
      backgroundColor: colors.success,
      borderRadius: 2,
    },
    goalPartialText: {
      fontSize: 11,
      fontFamily: fonts.body.medium,
      color: colors.success,
    },
    heroSection: {
      paddingHorizontal: space.lg,
      marginTop: space.xl,
      marginBottom: space.xs,
    },
    heroSectionLabel: {
      ...type.eyebrow,
      color: colors.tertiary,
      marginBottom: space.sm,
    },
    heroCard: {
      borderRadius: radius.xxl,
      overflow: "hidden",
      ...shadows.card.native,
    },
    heroImageBg: {
      minHeight: HERO_CARD_HEIGHT,
    },
    heroImageStyle: {
      borderRadius: radius.xxl,
    },
    heroOverlay: {
      flex: 1,
      backgroundColor: "rgba(15, 17, 22, 0.45)",
    },
    heroColorBg: {
      minHeight: HERO_CARD_HEIGHT,
    },
    heroContent: {
      flexDirection: "row",
      padding: space.xl,
      minHeight: HERO_CARD_HEIGHT,
      alignItems: "flex-end",
    },
    heroTextContent: {
      flex: 1,
      justifyContent: "flex-end",
    },
    heroEyebrow: {
      fontFamily: fonts.body.medium,
      fontSize: 11,
      letterSpacing: 1.6,
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.78)",
      marginBottom: space.sm,
    },
    heroBookTitle: {
      fontFamily: fonts.display.regular,
      fontSize: 28,
      lineHeight: 32,
      color: "#FFFFFF",
      marginBottom: space.xs,
      letterSpacing: -0.4,
    },
    heroAuthor: {
      fontFamily: fonts.display.italic,
      fontStyle: "italic",
      fontSize: 16,
      lineHeight: 22,
      color: "rgba(255,255,255,0.82)",
      marginBottom: space.sm + 2,
    },
    heroMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    heroDurationText: {
      fontFamily: fonts.body.regular,
      fontSize: 13,
      color: "rgba(255,255,255,0.85)",
    },
    heroPlayButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "flex-end",
      marginLeft: space.md,
      paddingLeft: 3,
      ...shadows.floating.native,
    },
    heroProgressContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: space.md,
      paddingBottom: space.sm,
    },
    heroProgress: {
      height: 3,
      backgroundColor: "rgba(255,255,255,0.25)",
      borderRadius: 2,
      overflow: "hidden",
    },
    heroProgressFill: {
      height: "100%",
      backgroundColor: "#FFFFFF",
      borderRadius: 2,
    },
    section: {
      marginTop: space.xxl,
    },
    sectionHeader: {
      paddingHorizontal: space.lg,
      marginBottom: space.md,
    },
    sectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    sectionTitle: {
      ...type.title,
      fontSize: 22,
      lineHeight: 26,
      color: colors.primary,
      letterSpacing: -0.4,
    },
    sectionSubtitle: {
      ...type.bodySmall,
      color: colors.secondary,
      marginTop: 4,
    },
    horizontalList: {
      paddingHorizontal: space.lg,
    },
    card: {
      width: CARD_WIDTH,
    },
    cardCoverContainer: {
      width: CARD_WIDTH,
      height: CARD_WIDTH * 1.05,
      borderRadius: radius.lg,
      overflow: "hidden",
      marginBottom: space.sm,
      ...shadows.tile.native,
    },
    cardCoverImage: {
      width: "100%",
      height: "100%",
    },
    playHintOverlay: {
      position: "absolute",
      bottom: 10,
      left: 10,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "center",
      alignItems: "center",
      paddingLeft: 2,
    },
    cardCover: {
      width: CARD_WIDTH,
      height: CARD_WIDTH * 1.05,
      borderRadius: radius.lg,
      padding: space.md,
      justifyContent: "space-between",
      marginBottom: space.sm,
      ...shadows.tile.native,
    },
    coverEyebrow: {
      fontFamily: fonts.body.medium,
      fontSize: 10,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.78)",
    },
    coverTitle: {
      fontFamily: fonts.display.regular,
      fontSize: 18,
      lineHeight: 22,
      color: "#FFFFFF",
      letterSpacing: -0.2,
    },
    trendingBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: colors.accentWarm,
      width: 22,
      height: 22,
      borderRadius: 11,
      justifyContent: "center",
      alignItems: "center",
    },
    cardInfo: {
      gap: 2,
    },
    cardTitle: {
      ...type.body,
      fontSize: 14,
      lineHeight: 18,
      color: colors.primary,
      letterSpacing: -0.1,
    },
    cardAuthor: {
      ...type.bodySmall,
      color: colors.secondary,
    },
    cardMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 2,
    },
    cardDuration: {
      ...type.caption,
      color: colors.tertiary,
    },
    footer: {
      paddingVertical: space.xxl,
      alignItems: "center",
    },
    footerText: {
      ...type.caption,
      color: colors.tertiary,
      letterSpacing: 0.4,
    },
  });
}
