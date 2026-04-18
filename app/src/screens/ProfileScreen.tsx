import React, { useState, useCallback } from "react";
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
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
  Star,
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
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";
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
  { id: "personal-development", name: "Personal Development", emoji: "🌱" },
  { id: "productivity", name: "Productivity", emoji: "⚡" },
  { id: "business", name: "Business & Entrepreneurship", emoji: "💼" },
  { id: "psychology", name: "Psychology & Mindset", emoji: "🧠" },
  { id: "money", name: "Money & Finance", emoji: "💰" },
  { id: "leadership", name: "Leadership", emoji: "👔" },
  { id: "health", name: "Health & Wellness", emoji: "🏃" },
  { id: "communication", name: "Communication", emoji: "💬" },
  { id: "relationships", name: "Relationships", emoji: "❤️" },
  { id: "career", name: "Career & Success", emoji: "🎯" },
  { id: "creativity", name: "Creativity", emoji: "🎨" },
  { id: "science", name: "Science & Technology", emoji: "🔬" },
  { id: "philosophy", name: "Philosophy", emoji: "💭" },
  { id: "history", name: "History", emoji: "📜" },
  { id: "parenting", name: "Parenting & Education", emoji: "👨‍👩‍👧" },
];

const SPEED_DESCRIPTIONS: Record<number, string> = {
  0.75: "Slower pace, great for complex content",
  1: "Normal speed",
  1.25: "Slightly faster, easy to follow",
  1.5: "Quick pace, good for familiar topics",
  1.75: "Fast listening",
  2: "Speed reader! Finish books in half the time",
};

function SettingsItem({
  icon: Icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  rightElement,
}: {
  icon: typeof User;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingsIcon}>
        <Icon size={20} color="#000" strokeWidth={1.5} />
      </View>
      <View style={styles.settingsContent}>
        <Text style={styles.settingsTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (showChevron && onPress && (
        <ChevronRight size={20} color="#ccc" strokeWidth={2} />
      ))}
    </TouchableOpacity>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const onboardingData = useAppSelector((state) => state.onboarding.data);
  const isSaving = useAppSelector((state) => state.onboarding.isSaving);
  const { data: stats } = useUserStats();

  const [showNameSheet, setShowNameSheet] = useState(false);
  const [showGoalSheet, setShowGoalSheet] = useState(false);
  const [showSpeedSheet, setShowSpeedSheet] = useState(false);
  const [showGenresSheet, setShowGenresSheet] = useState(false);
  const [showSleepSheet, setShowSleepSheet] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(0);
  const [tempName, setTempName] = useState("");

  const displayName = onboardingData.displayName || user?.name || "User";
  const monthlyGoal = onboardingData.monthlyGoal || 2;
  const preferredSpeed = onboardingData.preferredSpeed || 1;
  const selectedGenres = onboardingData.selectedGenres || [];

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            dispatch(resetOnboarding());
            dispatch(logout());
          },
        },
      ]
    );
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

  const sleepTimerLabel = sleepTimer === 0 
    ? "Off" 
    : sleepTimer === 60 
      ? "1 hour" 
      : `${sleepTimer} minutes`;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <TouchableOpacity style={styles.profileCard} onPress={handleOpenNameSheet}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName[0]?.toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <ChevronRight size={20} color="#ccc" strokeWidth={2} />
        </TouchableOpacity>

        {/* Monthly Goal Progress Card */}
        <TouchableOpacity 
          style={styles.goalProgressCard} 
          onPress={() => setShowGoalSheet(true)}
          activeOpacity={0.8}
        >
          <View style={styles.goalProgressLeft}>
            <View style={styles.goalProgressRing}>
              <View 
                style={[
                  styles.goalProgressFill,
                  { 
                    transform: [{ rotate: `${Math.min((stats?.progressPercent || 0) * 3.6, 360)}deg` }]
                  }
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
            <Text style={styles.goalProgressTitle}>This Month</Text>
            <Text style={styles.goalProgressSubtitle}>
              {!stats || (stats.completedThisMonth === 0 && stats.inProgressCount === 0)
                ? "Start listening to track progress"
                : (stats.completedThisMonth || 0) >= monthlyGoal 
                  ? "🎉 Goal reached!" 
                  : `${monthlyGoal - (stats?.completedThisMonth || 0)} more to reach your goal`}
            </Text>
            {(stats?.partialProgress || 0) > 0 && (
              <View style={styles.partialProgressBar}>
                <View 
                  style={[
                    styles.partialProgressFill, 
                    { width: `${(stats?.partialProgress || 0) * 100}%` }
                  ]} 
                />
                <Text style={styles.partialProgressText}>
                  +{Math.round((stats?.partialProgress || 0) * 100)}% in progress
                </Text>
              </View>
            )}
          </View>
          <ChevronRight size={20} color="#ccc" strokeWidth={2} />
        </TouchableOpacity>

        {/* Speed & Interests Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard} onPress={() => setShowSpeedSheet(true)}>
            <Zap size={20} color={Colors.accent} strokeWidth={1.5} />
            <Text style={styles.statValue}>{preferredSpeed}x</Text>
            <Text style={styles.statLabel}>
              {preferredSpeed === 1 ? "Normal" : preferredSpeed < 1 ? "Slower" : "Faster"}
            </Text>
          </TouchableOpacity>
          <View style={styles.statCardWide}>
            <TouchableOpacity 
              style={styles.interestsChipContainer}
              onPress={() => setShowGenresSheet(true)}
            >
              {selectedGenres.slice(0, 3).map((genreId) => {
                const genre = GENRES.find(g => g.id === genreId);
                return genre ? (
                  <View key={genreId} style={styles.interestChip}>
                    <Text style={styles.interestChipText}>{genre.name.split(' ')[0]}</Text>
                  </View>
                ) : null;
              })}
              {selectedGenres.length > 3 && (
                <View style={styles.interestChipMore}>
                  <Text style={styles.interestChipMoreText}>+{selectedGenres.length - 3}</Text>
                </View>
              )}
              {selectedGenres.length === 0 && (
                <Text style={styles.noInterests}>Tap to select interests</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <SettingsSection title="Preferences">
          <SettingsItem
            icon={Target}
            title="Reading Goal"
            subtitle={`${monthlyGoal} ${monthlyGoal === 1 ? "book" : "books"} per month`}
            onPress={() => setShowGoalSheet(true)}
          />
          <SettingsItem
            icon={Clock}
            title="Playback Speed"
            subtitle={`${preferredSpeed}x`}
            onPress={() => setShowSpeedSheet(true)}
          />
          <SettingsItem
            icon={BookOpen}
            title="Interests"
            subtitle={`${selectedGenres.length} categories selected`}
            onPress={() => setShowGenresSheet(true)}
          />
        </SettingsSection>

        <SettingsSection title="App Settings">
          <SettingsItem
            icon={Bell}
            title="Notifications"
            subtitle="Daily reminders & new releases"
            showChevron={false}
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#e0e0e0", true: "#000" }}
                thumbColor="#fff"
              />
            }
          />
          <SettingsItem
            icon={Moon}
            title="Sleep Timer Default"
            subtitle={sleepTimerLabel}
            onPress={() => setShowSleepSheet(true)}
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsItem
            icon={HelpCircle}
            title="Help & FAQ"
            onPress={() => handleOpenLink("https://example.com/help")}
          />
          <SettingsItem
            icon={FileText}
            title="Terms of Service"
            onPress={() => handleOpenLink("https://example.com/terms")}
          />
          <SettingsItem
            icon={Shield}
            title="Privacy Policy"
            onPress={() => handleOpenLink("https://example.com/privacy")}
          />
        </SettingsSection>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#FF3B30" strokeWidth={2} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>

      {/* Edit Name Sheet */}
      <BottomSheet
        visible={showNameSheet}
        onClose={() => setShowNameSheet(false)}
        title="Edit Name"
      >
        <TextInput
          style={styles.nameInput}
          value={tempName}
          onChangeText={setTempName}
          placeholder="Your name"
          placeholderTextColor="#999"
          autoFocus
          maxLength={30}
        />
        <TouchableOpacity
          style={[styles.saveButton, tempName.trim().length < 2 && styles.saveButtonDisabled]}
          onPress={handleSaveName}
          disabled={tempName.trim().length < 2}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* Monthly Goal Sheet */}
      <BottomSheet
        visible={showGoalSheet}
        onClose={() => setShowGoalSheet(false)}
        title="Monthly Reading Goal"
      >
        <Text style={styles.sheetDescription}>
          How many books do you want to finish each month?
        </Text>
        <View style={styles.optionsGrid}>
          {MONTHLY_GOALS.map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[
                styles.goalOption,
                monthlyGoal === goal && styles.goalOptionSelected,
              ]}
              onPress={() => handleSelectGoal(goal)}
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
                  styles.goalLabel,
                  monthlyGoal === goal && styles.goalLabelSelected,
                ]}
              >
                {goal === 1 ? "book" : "books"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>

      {/* Playback Speed Sheet */}
      <BottomSheet
        visible={showSpeedSheet}
        onClose={() => setShowSpeedSheet(false)}
        title="Default Playback Speed"
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
            >
              <View style={styles.speedOptionContent}>
                <Text
                  style={[
                    styles.speedValue,
                    preferredSpeed === speed && styles.speedValueSelected,
                  ]}
                >
                  {speed}x
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
                <Check size={20} color="#fff" strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>

      {/* Genres Sheet */}
      <BottomSheet
        visible={showGenresSheet}
        onClose={handleSaveGenres}
        title="Your Interests"
      >
        <Text style={styles.sheetDescription}>
          Select topics you're interested in. This helps us personalize your recommendations.
        </Text>
        <ScrollView style={styles.genresList} showsVerticalScrollIndicator={false}>
          {GENRES.map((genre) => {
            const isSelected = selectedGenres.includes(genre.id);
            return (
              <TouchableOpacity
                key={genre.id}
                style={[styles.genreOption, isSelected && styles.genreOptionSelected]}
                onPress={() => handleToggleGenre(genre.id)}
              >
                <Text style={styles.genreEmoji}>{genre.emoji}</Text>
                <Text
                  style={[styles.genreName, isSelected && styles.genreNameSelected]}
                >
                  {genre.name}
                </Text>
                {isSelected && <Check size={18} color="#fff" strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveGenres}>
          <Text style={styles.saveButtonText}>Done</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* Sleep Timer Sheet */}
      <BottomSheet
        visible={showSleepSheet}
        onClose={() => setShowSleepSheet(false)}
        title="Sleep Timer"
      >
        <Text style={styles.sheetDescription}>
          Automatically stop playback after a set time.
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
                <Check size={18} color="#fff" strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "#000",
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#888",
    marginTop: 2,
  },
  goalProgressCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 16,
  },
  goalProgressLeft: {
    marginRight: 16,
  },
  goalProgressRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e8e8e8",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  goalProgressFill: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: Colors.accent,
  },
  goalProgressInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
  },
  goalProgressNumber: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: "#000",
  },
  goalProgressOf: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#888",
  },
  goalProgressRight: {
    flex: 1,
  },
  goalProgressTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: "#000",
  },
  goalProgressSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#666",
    marginTop: 2,
  },
  partialProgressBar: {
    marginTop: 8,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    overflow: "hidden",
  },
  partialProgressFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    opacity: 0.5,
  },
  partialProgressText: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#888",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    minWidth: 80,
  },
  statCardWide: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
  },
  statValue: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: "#000",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#888",
    marginTop: 2,
    textAlign: "center",
  },
  interestsChipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  interestChip: {
    backgroundColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  interestChipText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: "#fff",
  },
  interestChipMore: {
    backgroundColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  interestChipMoreText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: "#666",
  },
  noInterests: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#888",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: "#f8f8f8",
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: "#000",
  },
  settingsSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#888",
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#FF3B30",
  },
  version: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 100,
  },
  // Sheet styles
  nameInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    fontFamily: Fonts.medium,
    color: "#000",
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#000",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#fff",
  },
  sheetDescription: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#888",
    marginBottom: 20,
    lineHeight: 20,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  goalOption: {
    width: "30%",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  goalOptionSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  goalNumber: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: "#000",
  },
  goalNumberSelected: {
    color: "#fff",
  },
  goalLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#888",
    marginTop: 2,
  },
  goalLabelSelected: {
    color: "rgba(255,255,255,0.7)",
  },
  speedOptions: {
    gap: 8,
  },
  speedOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  speedOptionSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  speedOptionContent: {
    flex: 1,
  },
  speedValue: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "#000",
  },
  speedValueSelected: {
    color: "#fff",
  },
  speedDescription: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#888",
    marginTop: 2,
  },
  speedDescriptionSelected: {
    color: "rgba(255,255,255,0.7)",
  },
  genresList: {
    maxHeight: 350,
    marginBottom: 16,
  },
  genreOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  genreOptionSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  genreEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  genreName: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: "#000",
  },
  genreNameSelected: {
    color: "#fff",
  },
  sleepOptions: {
    gap: 8,
  },
  sleepOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  sleepOptionSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  sleepOptionText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#000",
  },
  sleepOptionTextSelected: {
    color: "#fff",
  },
});
