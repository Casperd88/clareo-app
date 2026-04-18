import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import {
  BookOpen,
  Headphones,
  Moon,
  Dumbbell,
  Car,
  Briefcase,
  Home,
  Sparkles,
  ChevronLeft,
  Check,
} from "lucide-react-native";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  nextStep,
  previousStep,
  setDisplayName,
  toggleGenre,
  toggleListeningHabit,
  setMonthlyGoal,
  setPreferredSpeed,
  saveOnboardingPreferences,
} from "../store/onboardingSlice";
import { Logo } from "../components/Logo";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";
import type { ListeningHabit, PlaybackSpeedPreference } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

const LISTENING_HABITS: {
  id: ListeningHabit;
  name: string;
  icon: typeof Car;
  description: string;
}[] = [
  {
    id: "commute",
    name: "Commuting",
    icon: Car,
    description: "On your way to work",
  },
  {
    id: "exercise",
    name: "Working Out",
    icon: Dumbbell,
    description: "At the gym or running",
  },
  {
    id: "bedtime",
    name: "Before Bed",
    icon: Moon,
    description: "Winding down at night",
  },
  {
    id: "housework",
    name: "Housework",
    icon: Home,
    description: "Cleaning or cooking",
  },
  {
    id: "relaxation",
    name: "Relaxing",
    icon: Headphones,
    description: "Just chilling out",
  },
  {
    id: "work",
    name: "While Working",
    icon: Briefcase,
    description: "Background listening",
  },
];

const MONTHLY_GOALS = [1, 2, 3, 4, 5, 6];
const PLAYBACK_SPEEDS: PlaybackSpeedPreference[] = [0.75, 1, 1.25, 1.5, 1.75, 2];

export function OnboardingScreen() {
  const dispatch = useAppDispatch();
  const { currentStep, totalSteps, data, isSaving, error } = useAppSelector(
    (state) => state.onboarding
  );

  const scrollViewRef = useRef<ScrollView>(null);
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withSpring(currentStep / (totalSteps - 1), {
      damping: 20,
      stiffness: 100,
    });
  }, [currentStep, totalSteps, progress]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const handleNext = useCallback(() => {
    if (currentStep === totalSteps - 1) {
      dispatch(saveOnboardingPreferences(data));
    } else {
      dispatch(nextStep());
    }
  }, [currentStep, totalSteps, dispatch, data]);

  const handleBack = useCallback(() => {
    dispatch(previousStep());
  }, [dispatch]);

  const canContinue = useCallback(() => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return data.displayName.trim().length >= 2;
      case 2:
        return data.selectedGenres.length >= 3;
      case 3:
        return data.listeningHabits.length >= 1;
      case 4:
        return true;
      default:
        return true;
    }
  }, [currentStep, data]);

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, progressBarStyle]} />
      </View>
      <Text style={styles.progressText}>
        {currentStep + 1} of {totalSteps}
      </Text>
    </View>
  );

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeIconContainer}>
        <Logo width={80} color={Colors.primary} />
      </View>
      <Text style={styles.welcomeTitle}>Welcome to Audiobooks</Text>
      <Text style={styles.welcomeSubtitle}>
        Let's personalize your experience in just a few quick steps. We'll help
        you discover stories you'll love.
      </Text>
      <View style={styles.featureList}>
        <FeatureItem
          icon={BookOpen}
          title="Curated Recommendations"
          description="Get personalized picks based on your tastes"
        />
        <FeatureItem
          icon={Headphones}
          title="Smart Listening"
          description="Pick up right where you left off"
        />
        <FeatureItem
          icon={Sparkles}
          title="Reading Goals"
          description="Track your progress and stay motivated"
        />
      </View>
    </View>
  );

  const renderProfileStep = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.stepContainer}
    >
      <Text style={styles.stepTitle}>What should we call you?</Text>
      <Text style={styles.stepSubtitle}>
        This helps us personalize your experience
      </Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.nameInput}
          placeholder="Enter your name"
          placeholderTextColor="#999"
          value={data.displayName}
          onChangeText={(text) => dispatch(setDisplayName(text))}
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus
          maxLength={30}
        />
        {data.displayName.length > 0 && (
          <Text style={styles.greeting}>
            Hi, {data.displayName}! 👋
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );

  const renderGenresStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What do you love to listen to?</Text>
      <Text style={styles.stepSubtitle}>
        Select at least 3 genres to get started
      </Text>
      <View style={styles.genreGrid}>
        {GENRES.map((genre) => {
          const isSelected = data.selectedGenres.includes(genre.id);
          return (
            <TouchableOpacity
              key={genre.id}
              style={[styles.genreChip, isSelected && styles.genreChipSelected]}
              onPress={() => dispatch(toggleGenre(genre.id))}
              activeOpacity={0.7}
            >
              <Text style={styles.genreEmoji}>{genre.emoji}</Text>
              <Text
                style={[
                  styles.genreText,
                  isSelected && styles.genreTextSelected,
                ]}
              >
                {genre.name}
              </Text>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Check size={12} color="#fff" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.selectionCount}>
        {data.selectedGenres.length} selected
        {data.selectedGenres.length < 3 && " (minimum 3)"}
      </Text>
    </View>
  );

  const renderHabitsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>When do you usually listen?</Text>
      <Text style={styles.stepSubtitle}>
        This helps us optimize your experience
      </Text>
      <View style={styles.habitsGrid}>
        {LISTENING_HABITS.map((habit) => {
          const isSelected = data.listeningHabits.includes(habit.id);
          const IconComponent = habit.icon;
          return (
            <TouchableOpacity
              key={habit.id}
              style={[styles.habitCard, isSelected && styles.habitCardSelected]}
              onPress={() => dispatch(toggleListeningHabit(habit.id))}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.habitIconContainer,
                  isSelected && styles.habitIconContainerSelected,
                ]}
              >
                <IconComponent
                  size={24}
                  color={isSelected ? "#fff" : Colors.primary}
                  strokeWidth={1.5}
                />
              </View>
              <Text
                style={[
                  styles.habitName,
                  isSelected && styles.habitNameSelected,
                ]}
              >
                {habit.name}
              </Text>
              <Text style={styles.habitDescription}>{habit.description}</Text>
              {isSelected && (
                <View style={styles.habitCheckmark}>
                  <Check size={14} color="#fff" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderGoalsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Set your listening goals</Text>
      <Text style={styles.stepSubtitle}>
        How many books would you like to finish each month?
      </Text>

      <View style={styles.goalSection}>
        <Text style={styles.goalLabel}>Monthly Goal</Text>
        <View style={styles.goalSelector}>
          {MONTHLY_GOALS.map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[
                styles.goalOption,
                data.monthlyGoal === goal && styles.goalOptionSelected,
              ]}
              onPress={() => dispatch(setMonthlyGoal(goal))}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.goalNumber,
                  data.monthlyGoal === goal && styles.goalNumberSelected,
                ]}
              >
                {goal}
              </Text>
              <Text
                style={[
                  styles.goalUnit,
                  data.monthlyGoal === goal && styles.goalUnitSelected,
                ]}
              >
                {goal === 1 ? "book" : "books"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.goalHint}>
          That's about {Math.ceil((data.monthlyGoal * 8) / 4)} hours per week
        </Text>
      </View>

      <View style={styles.speedSection}>
        <Text style={styles.goalLabel}>Preferred Playback Speed</Text>
        <View style={styles.speedSelector}>
          {PLAYBACK_SPEEDS.map((speed) => (
            <TouchableOpacity
              key={speed}
              style={[
                styles.speedOption,
                data.preferredSpeed === speed && styles.speedOptionSelected,
              ]}
              onPress={() => dispatch(setPreferredSpeed(speed))}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.speedText,
                  data.preferredSpeed === speed && styles.speedTextSelected,
                ]}
              >
                {speed}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.speedHint}>
          {data.preferredSpeed === 1
            ? "Normal speed, perfect for immersion"
            : data.preferredSpeed < 1
            ? "Slower pace, great for complex narratives"
            : data.preferredSpeed <= 1.25
            ? "Slightly faster, still easy to follow"
            : data.preferredSpeed <= 1.5
            ? "Quick pace, good for familiar content"
            : "Speed listener! Finish books faster"}
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderProfileStep();
      case 2:
        return renderGenresStep();
      case 3:
        return renderHabitsStep();
      case 4:
        return renderGoalsStep();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentStep > 0 && renderProgressBar()}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderCurrentStep()}
      </ScrollView>
      <View style={styles.footer}>
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <View style={styles.footerButtons}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
              disabled={isSaving}
            >
              <ChevronLeft size={24} color={Colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.continueButton,
              currentStep === 0 && styles.continueButtonFull,
              (!canContinue() || isSaving) && styles.continueButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canContinue() || isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>
                {currentStep === 0
                  ? "Get Started"
                  : currentStep === totalSteps - 1
                  ? "Start Listening"
                  : "Continue"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Icon size={24} color={Colors.primary} strokeWidth={1.5} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: "#999",
    minWidth: 50,
    textAlign: "right",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 100,
  },
  welcomeIconContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 40,
  },
  welcomeTitle: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 17,
    color: "#666",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  featureList: {
    gap: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#f8f8f8",
    padding: 20,
    borderRadius: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#888",
  },
  stepTitle: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: Colors.primary,
    marginBottom: 12,
  },
  stepSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#888",
    marginBottom: 32,
  },
  inputWrapper: {
    gap: 16,
  },
  nameInput: {
    fontFamily: Fonts.medium,
    fontSize: 20,
    color: Colors.primary,
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greeting: {
    fontFamily: Fonts.medium,
    fontSize: 24,
    color: Colors.primary,
    textAlign: "center",
    marginTop: 24,
  },
  genreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  genreChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "transparent",
  },
  genreChipSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  genreEmoji: {
    fontSize: 18,
  },
  genreText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.primary,
  },
  genreTextSelected: {
    color: "#fff",
  },
  checkmark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  selectionCount: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  habitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  habitCard: {
    width: (SCREEN_WIDTH - 48 - 12) / 2,
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  habitCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: "#fafafa",
  },
  habitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  habitIconContainerSelected: {
    backgroundColor: Colors.primary,
  },
  habitName: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.primary,
    marginBottom: 4,
  },
  habitNameSelected: {
    color: Colors.primary,
  },
  habitDescription: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#888",
  },
  habitCheckmark: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  goalSection: {
    marginBottom: 40,
  },
  goalLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  goalSelector: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  goalOption: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  goalOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goalNumber: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.primary,
  },
  goalNumberSelected: {
    color: "#fff",
  },
  goalUnit: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  goalUnitSelected: {
    color: "rgba(255,255,255,0.8)",
  },
  goalHint: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#888",
    textAlign: "center",
  },
  speedSection: {
    marginBottom: 20,
  },
  speedSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  speedOption: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  speedOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  speedText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.primary,
  },
  speedTextSelected: {
    color: "#fff",
  },
  speedHint: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#888",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 36,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  footerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  errorBanner: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontFamily: Fonts.regular,
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  continueButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonFull: {
    flex: 1,
  },
  continueButtonDisabled: {
    opacity: 0.4,
  },
  continueButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 17,
    color: "#fff",
  },
});
