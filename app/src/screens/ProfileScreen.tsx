import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  BookOpen,
  Clock,
  Target,
  Zap,
  Bell,
  Moon,
  Sun,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
  Check,
} from "lucide-react-native";
import { useAppDispatch, useAppSelector, useUserStats } from "../hooks";
import { logout } from "../store/authSlice";
import {
  resetOnboarding,
  setDisplayName,
  setMonthlyGoal,
  setPreferredSpeed,
  toggleGenre,
  saveOnboardingPreferences,
} from "../store/onboardingSlice";
import { BottomSheet } from "../components/BottomSheet";
import { useTheme, useThemeControl } from "../theme";
import type { AppTheme } from "../theme";
import type { PlaybackSpeedPreference } from "../types";

const MONTHLY_GOALS = [1, 2, 3, 4, 5, 6, 8, 10, 12];
const PLAYBACK_SPEEDS: PlaybackSpeedPreference[] = [0.75, 1, 1.25, 1.5, 1.75, 2];
const SLEEP_TIMER_OPTIONS = [
  { value: 0, label: "Off" },
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
];

const GENRES = [
  { id: "personal-development", name: "Personal Development" },
  { id: "productivity", name: "Productivity" },
  { id: "business", name: "Business & Entrepreneurship" },
  { id: "psychology", name: "Psychology & Mindset" },
  { id: "money", name: "Money & Finance" },
  { id: "leadership", name: "Leadership" },
  { id: "health", name: "Health & Wellness" },
  { id: "communication", name: "Communication" },
  { id: "relationships", name: "Relationships" },
  { id: "career", name: "Career & Success" },
  { id: "creativity", name: "Creativity" },
  { id: "science", name: "Science & Technology" },
  { id: "philosophy", name: "Philosophy" },
  { id: "history", name: "History" },
  { id: "parenting", name: "Parenting & Education" },
];

const SPEED_DESCRIPTIONS: Record<number, string> = {
  0.75: "Slower — for layered, language-rich writing.",
  1: "Natural cadence.",
  1.25: "A touch faster, still effortless.",
  1.5: "Brisk — best for familiar territory.",
  1.75: "Quick listening.",
  2: "You finish books quickly.",
};

interface SettingsItemProps {
  icon: typeof User;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
  theme: AppTheme;
  styles: ReturnType<typeof createStyles>;
}

function SettingsItem({
  icon: Icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  rightElement,
  theme,
  styles,
}: SettingsItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingsIcon}>
        <Icon size={18} color={theme.colors.primary} strokeWidth={1.5} />
      </View>
      <View style={styles.settingsContent}>
        <Text style={styles.settingsTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement ||
        (showChevron && onPress && (
          <ChevronRight size={18} color={theme.colors.quaternary} strokeWidth={1.8} />
        ))}
    </TouchableOpacity>
  );
}

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
}

function SettingsSection({ title, children, styles }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { scheme, toggle: toggleTheme } = useThemeControl();
  const isDark = scheme === "dark";
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = useAppSelector((state) => state.auth.user);
  const onboardingData = useAppSelector((state) => state.onboarding.data);
  const { data: stats } = useUserStats();

  const [showNameSheet, setShowNameSheet] = useState(false);
  const [showGoalSheet, setShowGoalSheet] = useState(false);
  const [showSpeedSheet, setShowSpeedSheet] = useState(false);
  const [showGenresSheet, setShowGenresSheet] = useState(false);
  const [showSleepSheet, setShowSleepSheet] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(0);
  const [tempName, setTempName] = useState("");

  const displayName = onboardingData.displayName || user?.name || "Listener";
  const monthlyGoal = onboardingData.monthlyGoal || 2;
  const preferredSpeed = onboardingData.preferredSpeed || 1;
  const selectedGenres = onboardingData.selectedGenres || [];

  const handleLogout = useCallback(() => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          dispatch(resetOnboarding());
          dispatch(logout());
        },
      },
    ]);
  }, [dispatch]);

  const savePreferences = useCallback(() => {
    dispatch(saveOnboardingPreferences(onboardingData));
  }, [dispatch, onboardingData]);

  const handleOpenNameSheet = () => {
    setTempName(displayName);
    setShowNameSheet(true);
  };

  const handleSaveName = () => {
    if (tempName.trim().length >= 2) {
      dispatch(setDisplayName(tempName.trim()));
      setShowNameSheet(false);
      setTimeout(savePreferences, 100);
    }
  };

  const handleSelectGoal = (goal: number) => {
    dispatch(setMonthlyGoal(goal));
    setShowGoalSheet(false);
    setTimeout(savePreferences, 100);
  };

  const handleSelectSpeed = (speed: PlaybackSpeedPreference) => {
    dispatch(setPreferredSpeed(speed));
    setShowSpeedSheet(false);
    setTimeout(savePreferences, 100);
  };

  const handleToggleGenre = (genreId: string) => {
    dispatch(toggleGenre(genreId));
  };

  const handleSaveGenres = () => {
    setShowGenresSheet(false);
    setTimeout(savePreferences, 100);
  };

  const handleSelectSleepTimer = (minutes: number) => {
    setSleepTimer(minutes);
    setShowSleepSheet(false);
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open link");
    });
  };

  const sleepTimerLabel =
    sleepTimer === 0 ? "Off" : sleepTimer === 60 ? "1 hour" : `${sleepTimer} minutes`;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Your account</Text>
          <Text style={styles.title}>Profile</Text>
        </View>

        <TouchableOpacity
          style={styles.profileCard}
          onPress={handleOpenNameSheet}
          activeOpacity={0.85}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName[0]?.toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <ChevronRight size={18} color={theme.colors.quaternary} strokeWidth={1.8} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.goalProgressCard}
          onPress={() => setShowGoalSheet(true)}
          activeOpacity={0.85}
        >
          <View style={styles.goalProgressLeft}>
            <View style={styles.goalProgressRing}>
              <View
                style={[
                  styles.goalProgressFill,
                  {
                    transform: [
                      {
                        rotate: `${Math.min((stats?.progressPercent || 0) * 3.6, 360)}deg`,
                      },
                    ],
                  },
                ]}
              />
              <View style={styles.goalProgressInner}>
                <Text style={styles.goalProgressNumber}>
                  {stats?.completedThisMonth || 0}
                </Text>
                <Text style={styles.goalProgressOf}>of {monthlyGoal}</Text>
              </View>
            </View>
          </View>
          <View style={styles.goalProgressRight}>
            <Text style={styles.goalProgressTitle}>This month</Text>
            <Text style={styles.goalProgressSubtitle}>
              {!stats ||
              (stats.completedThisMonth === 0 && stats.inProgressCount === 0)
                ? "Start listening to track progress."
                : (stats.completedThisMonth || 0) >= monthlyGoal
                  ? "Goal reached — quietly well done."
                  : `${monthlyGoal - (stats?.completedThisMonth || 0)} more to reach your goal.`}
            </Text>
            {(stats?.partialProgress || 0) > 0 && (
              <View style={styles.partialProgressBar}>
                <View
                  style={[
                    styles.partialProgressFill,
                    { width: `${(stats?.partialProgress || 0) * 100}%` },
                  ]}
                />
                <Text style={styles.partialProgressText}>
                  +{Math.round((stats?.partialProgress || 0) * 100)}% in progress
                </Text>
              </View>
            )}
          </View>
          <ChevronRight size={18} color={theme.colors.quaternary} strokeWidth={1.8} />
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setShowSpeedSheet(true)}
            activeOpacity={0.85}
          >
            <Zap size={18} color={theme.colors.primary} strokeWidth={1.5} />
            <Text style={styles.statValue}>{preferredSpeed}×</Text>
            <Text style={styles.statLabel}>
              {preferredSpeed === 1 ? "Natural" : preferredSpeed < 1 ? "Slower" : "Faster"}
            </Text>
          </TouchableOpacity>
          <View style={styles.statCardWide}>
            <TouchableOpacity
              style={styles.interestsChipContainer}
              onPress={() => setShowGenresSheet(true)}
              activeOpacity={0.85}
            >
              {selectedGenres.slice(0, 3).map((genreId) => {
                const genre = GENRES.find((g) => g.id === genreId);
                return genre ? (
                  <View key={genreId} style={styles.interestChip}>
                    <Text style={styles.interestChipText}>
                      {genre.name.split(" ")[0]}
                    </Text>
                  </View>
                ) : null;
              })}
              {selectedGenres.length > 3 && (
                <View style={styles.interestChipMore}>
                  <Text style={styles.interestChipMoreText}>
                    +{selectedGenres.length - 3}
                  </Text>
                </View>
              )}
              {selectedGenres.length === 0 && (
                <Text style={styles.noInterests}>Tap to select interests</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <SettingsSection title="Preferences" styles={styles}>
          <SettingsItem
            icon={Target}
            title="Reading goal"
            subtitle={`${monthlyGoal} ${monthlyGoal === 1 ? "book" : "books"} per month`}
            onPress={() => setShowGoalSheet(true)}
            theme={theme}
            styles={styles}
          />
          <SettingsItem
            icon={Clock}
            title="Listening speed"
            subtitle={`${preferredSpeed}×`}
            onPress={() => setShowSpeedSheet(true)}
            theme={theme}
            styles={styles}
          />
          <SettingsItem
            icon={BookOpen}
            title="Interests"
            subtitle={`${selectedGenres.length} categories selected`}
            onPress={() => setShowGenresSheet(true)}
            theme={theme}
            styles={styles}
          />
        </SettingsSection>

        <SettingsSection title="App settings" styles={styles}>
          <SettingsItem
            icon={Bell}
            title="Notifications"
            subtitle="Daily reminders & new releases"
            showChevron={false}
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.primaryInverse}
              />
            }
            theme={theme}
            styles={styles}
          />
          <SettingsItem
            icon={isDark ? Moon : Sun}
            title="Dark mode"
            subtitle={isDark ? "On" : "Off"}
            showChevron={false}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.primaryInverse}
              />
            }
            theme={theme}
            styles={styles}
          />
          <SettingsItem
            icon={Clock}
            title="Sleep timer"
            subtitle={sleepTimerLabel}
            onPress={() => setShowSleepSheet(true)}
            theme={theme}
            styles={styles}
          />
        </SettingsSection>

        <SettingsSection title="Support" styles={styles}>
          <SettingsItem
            icon={HelpCircle}
            title="Help & FAQ"
            onPress={() => handleOpenLink("https://example.com/help")}
            theme={theme}
            styles={styles}
          />
          <SettingsItem
            icon={FileText}
            title="Terms of service"
            onPress={() => handleOpenLink("https://example.com/terms")}
            theme={theme}
            styles={styles}
          />
          <SettingsItem
            icon={Shield}
            title="Privacy policy"
            onPress={() => handleOpenLink("https://example.com/privacy")}
            theme={theme}
            styles={styles}
          />
        </SettingsSection>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <LogOut size={18} color={theme.colors.danger} strokeWidth={1.8} />
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>

      <BottomSheet
        visible={showNameSheet}
        onClose={() => setShowNameSheet(false)}
        title="Edit name"
      >
        <TextInput
          style={styles.nameInput}
          value={tempName}
          onChangeText={setTempName}
          placeholder="Your name"
          placeholderTextColor={theme.colors.tertiary}
          autoFocus
          maxLength={30}
        />
        <TouchableOpacity
          style={[
            styles.saveButton,
            tempName.trim().length < 2 && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveName}
          disabled={tempName.trim().length < 2}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </BottomSheet>

      <BottomSheet
        visible={showGoalSheet}
        onClose={() => setShowGoalSheet(false)}
        title="Monthly reading goal"
      >
        <Text style={styles.sheetDescription}>
          How many books would you like to finish each month?
        </Text>
        <View style={styles.optionsGrid}>
          {MONTHLY_GOALS.map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[styles.goalOption, monthlyGoal === goal && styles.goalOptionSelected]}
              onPress={() => handleSelectGoal(goal)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.goalNumber,
                  monthlyGoal === goal && styles.goalNumberSelected,
                ]}
              >
                {goal}
              </Text>
              <Text
                style={[
                  styles.goalOptionLabel,
                  monthlyGoal === goal && styles.goalOptionLabelSelected,
                ]}
              >
                {goal === 1 ? "book" : "books"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>

      <BottomSheet
        visible={showSpeedSheet}
        onClose={() => setShowSpeedSheet(false)}
        title="Listening speed"
      >
        <View style={styles.speedOptions}>
          {PLAYBACK_SPEEDS.map((speed) => (
            <TouchableOpacity
              key={speed}
              style={[
                styles.speedOption,
                preferredSpeed === speed && styles.speedOptionSelected,
              ]}
              onPress={() => handleSelectSpeed(speed)}
              activeOpacity={0.85}
            >
              <View style={styles.speedOptionContent}>
                <Text
                  style={[
                    styles.speedValue,
                    preferredSpeed === speed && styles.speedValueSelected,
                  ]}
                >
                  {speed}×
                </Text>
                <Text
                  style={[
                    styles.speedDescription,
                    preferredSpeed === speed && styles.speedDescriptionSelected,
                  ]}
                >
                  {SPEED_DESCRIPTIONS[speed]}
                </Text>
              </View>
              {preferredSpeed === speed && (
                <Check size={18} color={theme.colors.primaryInverse} strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>

      <BottomSheet
        visible={showGenresSheet}
        onClose={handleSaveGenres}
        title="Your interests"
      >
        <Text style={styles.sheetDescription}>
          Pick the topics you’d like more of. We’ll use them as starting points.
        </Text>
        <ScrollView style={styles.genresList} showsVerticalScrollIndicator={false}>
          {GENRES.map((genre) => {
            const isSelected = selectedGenres.includes(genre.id);
            return (
              <TouchableOpacity
                key={genre.id}
                style={[styles.genreOption, isSelected && styles.genreOptionSelected]}
                onPress={() => handleToggleGenre(genre.id)}
                activeOpacity={0.85}
              >
                <Text
                  style={[styles.genreName, isSelected && styles.genreNameSelected]}
                >
                  {genre.name}
                </Text>
                {isSelected && (
                  <Check size={16} color={theme.colors.primaryInverse} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveGenres}>
          <Text style={styles.saveButtonText}>Done</Text>
        </TouchableOpacity>
      </BottomSheet>

      <BottomSheet
        visible={showSleepSheet}
        onClose={() => setShowSleepSheet(false)}
        title="Sleep timer"
      >
        <Text style={styles.sheetDescription}>
          Stop playback automatically after a set time.
        </Text>
        <View style={styles.sleepOptions}>
          {SLEEP_TIMER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sleepOption,
                sleepTimer === option.value && styles.sleepOptionSelected,
              ]}
              onPress={() => handleSelectSleepTimer(option.value)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.sleepOptionText,
                  sleepTimer === option.value && styles.sleepOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
              {sleepTimer === option.value && (
                <Check size={16} color={theme.colors.primaryInverse} strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, type, space, radius, shadows, fonts, scheme } = theme;
  // Muted secondary tone that sits on top of `colors.primary` (a selected
  // pill background). primary inverts between light/dark, so this needs to
  // invert too — otherwise white-on-white in dark mode.
  const onPrimaryMuted =
    scheme === "dark" ? "rgba(26, 29, 36, 0.7)" : "rgba(255, 255, 255, 0.78)";
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
    profileCard: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: space.xl,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: space.md,
      marginBottom: space.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.tile.native,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      fontFamily: fonts.display.regular,
      fontSize: 22,
      color: colors.primaryInverse,
      letterSpacing: -0.4,
    },
    profileInfo: {
      flex: 1,
      marginLeft: space.md,
    },
    profileName: {
      ...type.body,
      fontFamily: fonts.body.medium,
      fontSize: 16,
      color: colors.primary,
    },
    profileEmail: {
      ...type.bodySmall,
      color: colors.secondary,
      marginTop: 2,
    },
    goalProgressCard: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: space.xl,
      marginBottom: space.md,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: space.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.tile.native,
    },
    goalProgressLeft: {
      marginRight: space.md,
    },
    goalProgressRing: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.surfaceMuted,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    goalProgressFill: {
      position: "absolute",
      width: "100%",
      height: "100%",
      backgroundColor: colors.primary,
    },
    goalProgressInner: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },
    goalProgressNumber: {
      fontFamily: fonts.display.regular,
      fontSize: 20,
      color: colors.primary,
      letterSpacing: -0.4,
    },
    goalProgressOf: {
      ...type.caption,
      fontSize: 10,
      color: colors.tertiary,
    },
    goalProgressRight: {
      flex: 1,
    },
    goalProgressTitle: {
      ...type.body,
      fontFamily: fonts.body.medium,
      fontSize: 15,
      color: colors.primary,
    },
    goalProgressSubtitle: {
      ...type.bodySmall,
      color: colors.secondary,
      marginTop: 2,
    },
    partialProgressBar: {
      marginTop: space.xs,
      height: 4,
      backgroundColor: colors.surfaceMuted,
      borderRadius: 2,
      overflow: "hidden",
    },
    partialProgressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      opacity: 0.5,
    },
    partialProgressText: {
      ...type.caption,
      fontSize: 10,
      color: colors.tertiary,
      marginTop: 4,
    },
    statsRow: {
      flexDirection: "row",
      marginHorizontal: space.xl,
      marginBottom: space.xl,
      gap: space.sm,
    },
    statCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: space.md,
      alignItems: "center",
      minWidth: 84,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statCardWide: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: space.sm,
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: {
      fontFamily: fonts.display.regular,
      fontSize: 22,
      color: colors.primary,
      letterSpacing: -0.4,
      marginTop: space.xs,
    },
    statLabel: {
      ...type.caption,
      color: colors.tertiary,
      marginTop: 2,
      textAlign: "center",
    },
    interestsChipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    interestChip: {
      backgroundColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radius.pill,
    },
    interestChipText: {
      ...type.caption,
      fontFamily: fonts.body.medium,
      color: colors.primaryInverse,
    },
    interestChipMore: {
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radius.pill,
    },
    interestChipMoreText: {
      ...type.caption,
      fontFamily: fonts.body.medium,
      color: colors.secondary,
    },
    noInterests: {
      ...type.caption,
      color: colors.tertiary,
    },
    section: {
      marginBottom: space.xl,
    },
    sectionTitle: {
      ...type.eyebrow,
      color: colors.tertiary,
      marginHorizontal: space.xl,
      marginBottom: space.sm,
    },
    sectionContent: {
      backgroundColor: colors.surface,
      marginHorizontal: space.xl,
      borderRadius: radius.xl,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingsItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: space.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    settingsIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.bg,
      justifyContent: "center",
      alignItems: "center",
      marginRight: space.sm + 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingsContent: {
      flex: 1,
    },
    settingsTitle: {
      ...type.body,
      fontFamily: fonts.body.medium,
      fontSize: 14,
      color: colors.primary,
    },
    settingsSubtitle: {
      ...type.caption,
      color: colors.secondary,
      marginTop: 2,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: space.xl,
      marginTop: space.xs,
      marginBottom: space.md,
      paddingVertical: space.md,
      backgroundColor: "rgba(214, 70, 58, 0.10)",
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: "rgba(214, 70, 58, 0.18)",
      gap: space.xs,
    },
    logoutText: {
      ...type.body,
      fontFamily: fonts.body.medium,
      color: colors.danger,
      fontSize: 15,
    },
    version: {
      ...type.caption,
      color: colors.quaternary,
      textAlign: "center",
      marginBottom: 100,
    },
    nameInput: {
      backgroundColor: colors.bg,
      borderRadius: radius.lg,
      paddingHorizontal: space.md,
      paddingVertical: space.sm + 4,
      fontSize: 17,
      fontFamily: fonts.body.medium,
      color: colors.primary,
      marginBottom: space.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: radius.pill,
      paddingVertical: space.md,
      alignItems: "center",
      ...shadows.floating.native,
    },
    saveButtonDisabled: {
      opacity: 0.4,
    },
    saveButtonText: {
      ...type.body,
      fontFamily: fonts.body.medium,
      fontSize: 15,
      color: colors.primaryInverse,
      letterSpacing: 0.2,
    },
    sheetDescription: {
      ...type.bodySmall,
      color: colors.secondary,
      marginBottom: space.lg,
    },
    optionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: space.xs + 2,
    },
    goalOption: {
      width: "30%",
      backgroundColor: colors.bg,
      borderRadius: radius.lg,
      paddingVertical: space.md,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    goalOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    goalNumber: {
      fontFamily: fonts.display.regular,
      fontSize: 22,
      color: colors.primary,
      letterSpacing: -0.4,
    },
    goalNumberSelected: {
      color: colors.primaryInverse,
    },
    goalOptionLabel: {
      ...type.caption,
      color: colors.tertiary,
      marginTop: 2,
    },
    goalOptionLabelSelected: {
      color: onPrimaryMuted,
    },
    speedOptions: {
      gap: space.xs,
    },
    speedOption: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.bg,
      borderRadius: radius.lg,
      padding: space.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    speedOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    speedOptionContent: {
      flex: 1,
    },
    speedValue: {
      fontFamily: fonts.display.regular,
      fontSize: 18,
      color: colors.primary,
      letterSpacing: -0.4,
    },
    speedValueSelected: {
      color: colors.primaryInverse,
    },
    speedDescription: {
      ...type.caption,
      color: colors.secondary,
      marginTop: 2,
    },
    speedDescriptionSelected: {
      color: onPrimaryMuted,
    },
    genresList: {
      maxHeight: 350,
      marginBottom: space.md,
    },
    genreOption: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.bg,
      borderRadius: radius.lg,
      padding: space.sm + 4,
      marginBottom: space.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    genreOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    genreName: {
      flex: 1,
      ...type.bodySmall,
      fontFamily: fonts.body.medium,
      color: colors.primary,
    },
    genreNameSelected: {
      color: colors.primaryInverse,
    },
    sleepOptions: {
      gap: space.xs,
    },
    sleepOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.bg,
      borderRadius: radius.lg,
      padding: space.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sleepOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sleepOptionText: {
      ...type.body,
      fontFamily: fonts.body.medium,
      fontSize: 14,
      color: colors.primary,
    },
    sleepOptionTextSelected: {
      color: colors.primaryInverse,
    },
  });
}
