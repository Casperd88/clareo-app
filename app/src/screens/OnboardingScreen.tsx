import React, { useRef, useCallback, useMemo, useState } from "react";
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
  setTotalSteps,
  toggleGenre,
  toggleListeningHabit,
  setMonthlyGoal,
  setPreferredSpeed,
  saveOnboardingPreferences,
} from "../store/onboardingSlice";
import { register, clearError as clearAuthError } from "../store/authSlice";
import { Logo } from "../components/Logo";
import {
  AuthSplitLayout,
  useIsAuthSplitLayout,
} from "../components/AuthSplitLayout";
import { useTheme } from "../theme";
import type { AppTheme } from "../theme";
import type { ListeningHabit, PlaybackSpeedPreference } from "../types";

interface OnboardingScreenProps {
  requiresAccountCreation?: boolean;
  onSignInPress?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

const LISTENING_HABITS: {
  id: ListeningHabit;
  name: string;
  icon: typeof Car;
  description: string;
}[] = [
  { id: "commute", name: "Commuting", icon: Car, description: "On your way to work" },
  { id: "exercise", name: "Working out", icon: Dumbbell, description: "At the gym or running" },
  { id: "bedtime", name: "Before bed", icon: Moon, description: "Winding down at night" },
  { id: "housework", name: "Housework", icon: Home, description: "Cleaning or cooking" },
  { id: "relaxation", name: "Relaxing", icon: Headphones, description: "Just chilling out" },
  { id: "work", name: "While working", icon: Briefcase, description: "Background listening" },
];

const MONTHLY_GOALS = [1, 2, 3, 4, 5, 6];
const PLAYBACK_SPEEDS: PlaybackSpeedPreference[] = [0.75, 1, 1.25, 1.5, 1.75, 2];

export function OnboardingScreen({
  requiresAccountCreation = false,
  onSignInPress,
}: OnboardingScreenProps = {}) {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isSplitLayout = useIsAuthSplitLayout();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const habitCardWidth = useMemo(() => {
    const frameWidth = isSplitLayout ? 560 : SCREEN_WIDTH;
    return (frameWidth - theme.space.xl * 2 - theme.space.sm) / 2;
  }, [isSplitLayout, theme.space.xl, theme.space.sm]);

  const { currentStep, totalSteps, data, isSaving, error } = useAppSelector(
    (state) => state.onboarding,
  );
  const { isLoading: isAuthLoading, error: authError } = useAppSelector(
    (state) => state.auth,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const setupStepCount = requiresAccountCreation ? 5 : 4;
  const desiredTotalSteps = requiresAccountCreation ? 6 : 5;

  React.useEffect(() => {
    if (totalSteps !== desiredTotalSteps) {
      dispatch(setTotalSteps(desiredTotalSteps));
    }
  }, [desiredTotalSteps, totalSteps, dispatch]);

  const accountStepIndex = requiresAccountCreation ? 5 : -1;
  const isAccountStep = currentStep === accountStepIndex;
  const isFinalStep = currentStep === desiredTotalSteps - 1;

  const scrollViewRef = useRef<ScrollView>(null);
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withSpring(currentStep / (desiredTotalSteps - 1), {
      damping: 20,
      stiffness: 100,
    });
  }, [currentStep, desiredTotalSteps, progress]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  React.useEffect(() => {
    if (isAccountStep) {
      dispatch(clearAuthError());
    }
  }, [isAccountStep, dispatch]);

  const handleNext = useCallback(async () => {
    if (!isFinalStep) {
      dispatch(nextStep());
      return;
    }

    if (requiresAccountCreation) {
      const result = await dispatch(
        register({
          email: email.trim(),
          password,
          name: data.displayName.trim() || undefined,
        }),
      );
      if (register.fulfilled.match(result)) {
        await dispatch(saveOnboardingPreferences(data));
      }
      return;
    }

    dispatch(saveOnboardingPreferences(data));
  }, [
    isFinalStep,
    requiresAccountCreation,
    dispatch,
    data,
    email,
    password,
  ]);

  const handleBack = useCallback(() => {
    dispatch(previousStep());
  }, [dispatch]);

  const canContinue = useCallback(() => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return data.selectedGenres.length >= 3;
      case 2:
        return data.listeningHabits.length >= 1;
      case 3:
        return true;
      case 4:
        return data.displayName.trim().length >= 2;
      case 5:
        return (
          EMAIL_REGEX.test(email.trim()) && password.length >= MIN_PASSWORD_LENGTH
        );
      default:
        return true;
    }
  }, [currentStep, data, email, password]);

  const renderProgressBar = () => {
    const row = (
      <View
        style={[
          styles.progressRow,
          isSplitLayout && styles.progressRowDesktop,
        ]}
      >
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, progressBarStyle]} />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {totalSteps}
        </Text>
      </View>
    );
    if (!isSplitLayout) return row;
    return <View style={styles.progressContainerDesktop}>{row}</View>;
  };

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeHeader}>
        <View style={styles.welcomeIconContainer}>
          <Logo width={64} color={theme.colors.primary} />
        </View>
        <Text style={styles.welcomeEyebrow}>An editorial library</Text>
        <Text style={styles.welcomeTitle}>
          Stories that{"\n"}
          <Text style={styles.welcomeTitleAccent}>stay with you.</Text>
        </Text>
        <Text style={styles.welcomeSubtitle}>
          We’ll set up the small things in a few steps so the right book finds
          you on the right morning.
        </Text>
      </View>
      <View style={styles.welcomeBody}>
        <View style={styles.featureList}>
          <FeatureItem
            icon={BookOpen}
            title="Hand-picked"
            description="Editor-curated, not algorithm-spun."
            theme={theme}
            styles={styles}
          />
          <FeatureItem
            icon={Headphones}
            title="Quietly resumed"
            description="Pick up exactly where you left off, on any device."
            theme={theme}
            styles={styles}
          />
          <FeatureItem
            icon={Sparkles}
            title="Gently guided"
            description="A reading rhythm that fits your week."
            theme={theme}
            styles={styles}
          />
        </View>
        {requiresAccountCreation && onSignInPress && (
          <TouchableOpacity
            style={styles.signInLink}
            onPress={onSignInPress}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Text style={styles.signInLinkText}>
              Already have an account?{" "}
              <Text style={styles.signInLinkAccent}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderProfileStep = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.stepContainer}
    >
      <View>
        <Text style={styles.stepEyebrow}>Step 4 of {setupStepCount}</Text>
        <Text style={styles.stepTitle}>What should we call you?</Text>
        <Text style={styles.stepSubtitle}>
          Just a first name is fine — we’ll use it now and again.
        </Text>
      </View>
      <View style={styles.stepBody}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.nameInput}
            placeholder="Your name"
            placeholderTextColor={theme.colors.tertiary}
            value={data.displayName}
            onChangeText={(text) => dispatch(setDisplayName(text))}
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus
            maxLength={30}
          />
          {data.displayName.length > 0 && (
            <Text style={styles.greeting}>
              <Text style={{ fontStyle: "italic" }}>Welcome,</Text>{" "}
              {data.displayName}.
            </Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  const renderGenresStep = () => (
    <View style={styles.stepContainer}>
      <View>
        <Text style={styles.stepEyebrow}>Step 1 of {setupStepCount}</Text>
        <Text style={styles.stepTitle}>What pulls you in?</Text>
        <Text style={styles.stepSubtitle}>
          Pick at least three. We’ll use them as starting points, not
          boundaries.
        </Text>
      </View>
      <View style={styles.stepBody}>
        <View style={styles.genreGrid}>
          {GENRES.map((genre) => {
            const isSelected = data.selectedGenres.includes(genre.id);
            return (
              <TouchableOpacity
                key={genre.id}
                style={[
                  styles.genreChip,
                  isSelected && styles.genreChipSelected,
                ]}
                onPress={() => dispatch(toggleGenre(genre.id))}
                activeOpacity={0.85}
              >
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
                    <Check
                      size={11}
                      color={theme.colors.primary}
                      strokeWidth={3}
                    />
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
    </View>
  );

  const renderHabitsStep = () => (
    <View style={styles.stepContainer}>
      <View>
        <Text style={styles.stepEyebrow}>Step 2 of {setupStepCount}</Text>
        <Text style={styles.stepTitle}>When do you usually listen?</Text>
        <Text style={styles.stepSubtitle}>
          We’ll tune what plays, and how, to match the moment.
        </Text>
      </View>
      <View style={styles.stepBody}>
        <View style={styles.habitsGrid}>
        {LISTENING_HABITS.map((habit) => {
          const isSelected = data.listeningHabits.includes(habit.id);
          const IconComponent = habit.icon;
          return (
            <TouchableOpacity
              key={habit.id}
              style={[
                styles.habitCard,
                { width: habitCardWidth },
                isSelected && styles.habitCardSelected,
              ]}
              onPress={() => dispatch(toggleListeningHabit(habit.id))}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.habitIconContainer,
                  isSelected && styles.habitIconContainerSelected,
                ]}
              >
                <IconComponent
                  size={22}
                  color={isSelected ? theme.colors.primaryInverse : theme.colors.primary}
                  strokeWidth={1.5}
                />
              </View>
              <Text style={[styles.habitName, isSelected && styles.habitNameSelected]}>
                {habit.name}
              </Text>
              <Text style={styles.habitDescription}>{habit.description}</Text>
              {isSelected && (
                <View style={styles.habitCheckmark}>
                  <Check size={12} color={theme.colors.primaryInverse} strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      </View>
    </View>
  );

  const renderGoalsStep = () => (
    <View style={styles.stepContainer}>
      <View>
        <Text style={styles.stepEyebrow}>Step 3 of {setupStepCount}</Text>
        <Text style={styles.stepTitle}>Set the rhythm.</Text>
        <Text style={styles.stepSubtitle}>
          How many books would you like to finish each month?
        </Text>
      </View>
      <View style={styles.stepBody}>
      <View style={styles.goalSection}>
        <Text style={styles.goalLabel}>Monthly goal</Text>
        <View style={styles.goalSelector}>
          {MONTHLY_GOALS.map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[
                styles.goalOption,
                data.monthlyGoal === goal && styles.goalOptionSelected,
              ]}
              onPress={() => dispatch(setMonthlyGoal(goal))}
              activeOpacity={0.85}
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
          About {Math.ceil((data.monthlyGoal * 8) / 4)} hours per week.
        </Text>
      </View>

      <View style={styles.speedSection}>
        <Text style={styles.goalLabel}>Listening speed</Text>
        <View style={styles.speedSelector}>
          {PLAYBACK_SPEEDS.map((speed) => (
            <TouchableOpacity
              key={speed}
              style={[
                styles.speedOption,
                data.preferredSpeed === speed && styles.speedOptionSelected,
              ]}
              onPress={() => dispatch(setPreferredSpeed(speed))}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.speedText,
                  data.preferredSpeed === speed && styles.speedTextSelected,
                ]}
              >
                {speed}×
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.speedHint}>
          {data.preferredSpeed === 1
            ? "Natural cadence — best for first listens."
            : data.preferredSpeed < 1
              ? "Slower — for layered, language-rich writing."
              : data.preferredSpeed <= 1.25
                ? "A touch faster, still effortless."
                : data.preferredSpeed <= 1.5
                  ? "Brisk — best for familiar territory."
                  : "Brisk and bracing. You finish books quickly."}
        </Text>
      </View>
      </View>
    </View>
  );

  const renderAccountStep = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.stepContainer}
    >
      <View>
        <Text style={styles.stepEyebrow}>
          Step {setupStepCount} of {setupStepCount}
        </Text>
        <Text style={styles.stepTitle}>Save your place.</Text>
        <Text style={styles.stepSubtitle}>
          Create an account so we can keep your library, progress, and
          preferences in sync across devices.
        </Text>
      </View>
      <View style={styles.stepBody}>
      <View style={styles.accountForm}>
        <View style={styles.accountFieldGroup}>
          <Text style={styles.accountLabel}>Email</Text>
          <TextInput
            style={styles.accountInput}
            placeholder="you@example.com"
            placeholderTextColor={theme.colors.tertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            editable={!isAuthLoading && !isSaving}
          />
        </View>
        <View style={styles.accountFieldGroup}>
          <Text style={styles.accountLabel}>Password</Text>
          <TextInput
            style={styles.accountInput}
            placeholder="At least 8 characters"
            placeholderTextColor={theme.colors.tertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password-new"
            textContentType="newPassword"
            editable={!isAuthLoading && !isSaving}
          />
        </View>
        <Text style={styles.accountFinePrint}>
          By creating an account, you agree to our Terms of Service and Privacy
          Policy.
        </Text>
      </View>
      {onSignInPress && (
        <TouchableOpacity
          style={styles.signInLink}
          onPress={onSignInPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          disabled={isAuthLoading || isSaving}
        >
          <Text style={styles.signInLinkText}>
            Already have an account?{" "}
            <Text style={styles.signInLinkAccent}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      )}
      </View>
    </KeyboardAvoidingView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderGenresStep();
      case 2:
        return renderHabitsStep();
      case 3:
        return renderGoalsStep();
      case 4:
        return renderProfileStep();
      case 5:
        return renderAccountStep();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthSplitLayout>
        {currentStep > 0 && renderProgressBar()}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            isSplitLayout && styles.scrollContentDesktop,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.stepFrame,
              isSplitLayout && styles.stepFrameDesktop,
            ]}
          >
            {renderCurrentStep()}
          </View>
        </ScrollView>
        <View
          style={[styles.footer, isSplitLayout && styles.footerDesktop]}
        >
          <View style={isSplitLayout ? styles.footerInner : undefined}>
            {(error || (isAccountStep && authError)) && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>
                  {isAccountStep && authError ? authError : error}
                </Text>
              </View>
            )}
            <View style={styles.footerButtons}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                  activeOpacity={0.7}
                  disabled={isSaving || isAuthLoading}
                >
                  <ChevronLeft
                    size={22}
                    color={theme.colors.primary}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  (!canContinue() || isSaving || isAuthLoading) &&
                    styles.continueButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={!canContinue() || isSaving || isAuthLoading}
                activeOpacity={0.85}
              >
                {isSaving || isAuthLoading ? (
                  <ActivityIndicator color={theme.colors.primaryInverse} />
                ) : (
                  <Text style={styles.continueButtonText}>
                    {currentStep === 0
                      ? "Begin"
                      : isAccountStep
                        ? "Create account"
                        : isFinalStep
                          ? "Start listening"
                          : "Continue"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </AuthSplitLayout>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  icon: typeof BookOpen;
  title: string;
  description: string;
  theme: AppTheme;
  styles: ReturnType<typeof createStyles>;
}

function FeatureItem({ icon: Icon, title, description, theme, styles }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Icon size={22} color={theme.colors.primary} strokeWidth={1.5} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, type, space, radius, shadows, fonts } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: space.xl,
      paddingTop: space.xs,
      paddingBottom: space.md,
      gap: space.sm,
    },
    progressRowDesktop: {
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,
    },
    progressContainerDesktop: {
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      paddingHorizontal: space.xl,
      paddingTop: space.lg,
      paddingBottom: space.md,
    },
    progressTrack: {
      flex: 1,
      height: 3,
      backgroundColor: colors.surfaceMuted,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    progressText: {
      ...type.caption,
      color: colors.tertiary,
      minWidth: 56,
      textAlign: "right",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: space.xl,
    },
    scrollContentDesktop: {
      paddingHorizontal: 0,
      alignItems: "center",
    },
    stepFrame: {
      flex: 1,
      width: "100%",
    },
    stepFrameDesktop: {
      maxWidth: 560,
      alignSelf: "center",
      paddingHorizontal: space.xl,
    },
    stepContainer: {
      flex: 1,
      paddingTop: space.lg,
      paddingBottom: 120,
    },
    welcomeHeader: {
      paddingTop: space.xl,
    },
    welcomeBody: {
      flex: 1,
      justifyContent: "center",
    },
    stepBody: {
      flex: 1,
      justifyContent: "center",
    },
    welcomeIconContainer: {
      alignItems: "center",
      marginBottom: space.xl,
    },
    welcomeEyebrow: {
      ...type.eyebrow,
      color: colors.tertiary,
      textAlign: "center",
      marginBottom: space.sm,
    },
    welcomeTitle: {
      fontFamily: fonts.display.regular,
      fontSize: 38,
      lineHeight: 42,
      color: colors.primary,
      textAlign: "center",
      letterSpacing: -0.6,
      marginBottom: space.md,
    },
    welcomeTitleAccent: {
      fontFamily: fonts.display.italic,
      fontStyle: "italic",
      color: colors.primary,
    },
    welcomeSubtitle: {
      ...type.bodyLarge,
      color: colors.secondary,
      textAlign: "center",
      paddingHorizontal: space.md,
    },
    featureList: {
      gap: space.sm,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: space.md,
      backgroundColor: colors.surface,
      padding: space.lg,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.tile.native,
    },
    featureIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.bg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      ...type.sectionLabel,
      color: colors.primary,
      marginBottom: 2,
      fontFamily: fonts.body.medium,
    },
    featureDescription: {
      ...type.bodySmall,
      color: colors.secondary,
    },
    stepEyebrow: {
      ...type.eyebrow,
      color: colors.tertiary,
      marginBottom: space.sm,
    },
    stepTitle: {
      fontFamily: fonts.display.italic,
      fontSize: 32,
      lineHeight: 36,
      color: colors.primary,
      marginBottom: space.sm,
      letterSpacing: -0.4,
      fontStyle: "italic",
    },
    stepSubtitle: {
      ...type.body,
      color: colors.secondary,
      marginBottom: space.xxl,
      maxWidth: 380,
    },
    inputWrapper: {
      gap: space.md,
    },
    nameInput: {
      fontFamily: fonts.display.regular,
      fontSize: 24,
      lineHeight: 28,
      color: colors.primary,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      paddingHorizontal: space.lg,
      paddingVertical: space.lg,
      borderWidth: 1,
      borderColor: colors.border,
      letterSpacing: -0.3,
    },
    greeting: {
      fontFamily: fonts.display.regular,
      fontSize: 22,
      lineHeight: 28,
      color: colors.primary,
      textAlign: "center",
      marginTop: space.lg,
      letterSpacing: -0.2,
    },
    genreGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: space.xs + 2,
      marginBottom: space.lg,
    },
    genreChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: space.xs,
      backgroundColor: colors.surface,
      paddingHorizontal: space.md,
      paddingVertical: space.sm - 2,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
    },
    genreChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    genreText: {
      ...type.bodySmall,
      fontFamily: fonts.body.medium,
      color: colors.primary,
    },
    genreTextSelected: {
      color: colors.primaryInverse,
    },
    checkmark: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.primaryInverse,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 2,
    },
    selectionCount: {
      ...type.caption,
      color: colors.tertiary,
      textAlign: "center",
    },
    habitsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: space.sm,
    },
    habitCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: space.md,
      borderWidth: 1,
      borderColor: colors.border,
      position: "relative",
      ...shadows.tile.native,
    },
    habitCardSelected: {
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    habitIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.bg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: space.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    habitIconContainerSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    habitName: {
      ...type.sectionLabel,
      fontFamily: fonts.body.medium,
      color: colors.primary,
      marginBottom: 2,
    },
    habitNameSelected: {
      color: colors.primary,
    },
    habitDescription: {
      ...type.caption,
      color: colors.secondary,
    },
    habitCheckmark: {
      position: "absolute",
      top: space.sm,
      right: space.sm,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    goalSection: {
      marginBottom: space.xxxl,
    },
    goalLabel: {
      ...type.eyebrow,
      color: colors.tertiary,
      marginBottom: space.md,
    },
    goalSelector: {
      flexDirection: "row",
      gap: space.xs + 2,
      marginBottom: space.sm,
    },
    goalOption: {
      flex: 1,
      backgroundColor: colors.surface,
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
      fontSize: 24,
      lineHeight: 28,
      color: colors.primary,
      letterSpacing: -0.4,
    },
    goalNumberSelected: {
      color: colors.primaryInverse,
    },
    goalUnit: {
      ...type.caption,
      color: colors.tertiary,
      marginTop: 2,
    },
    goalUnitSelected: {
      color: "rgba(255,255,255,0.78)",
    },
    goalHint: {
      ...type.bodySmall,
      color: colors.secondary,
      textAlign: "center",
    },
    speedSection: {
      marginBottom: space.lg,
    },
    speedSelector: {
      flexDirection: "row",
      gap: space.xs,
      marginBottom: space.sm,
    },
    speedOption: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      paddingVertical: space.sm + 2,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    speedOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    speedText: {
      ...type.bodySmall,
      fontFamily: fonts.body.medium,
      color: colors.primary,
    },
    speedTextSelected: {
      color: colors.primaryInverse,
    },
    speedHint: {
      ...type.bodySmall,
      color: colors.secondary,
      textAlign: "center",
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: space.xl,
      paddingBottom: space.xxl + 8,
      backgroundColor: colors.bg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    footerDesktop: {
      paddingHorizontal: 0,
      alignItems: "center",
    },
    footerInner: {
      width: "100%",
      maxWidth: 560,
      paddingHorizontal: space.xl,
    },
    footerButtons: {
      flexDirection: "row",
      gap: space.sm,
    },
    errorBanner: {
      backgroundColor: "rgba(214, 70, 58, 0.10)",
      borderRadius: radius.md,
      padding: space.sm + 2,
      marginBottom: space.sm,
      borderWidth: 1,
      borderColor: "rgba(214, 70, 58, 0.18)",
    },
    errorText: {
      fontFamily: fonts.body.regular,
      color: colors.danger,
      fontSize: 13,
      textAlign: "center",
    },
    backButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    continueButton: {
      flex: 1,
      height: 52,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      ...shadows.floating.native,
    },
    continueButtonDisabled: {
      opacity: 0.45,
    },
    continueButtonText: {
      fontFamily: fonts.body.medium,
      fontSize: 16,
      color: colors.primaryInverse,
      letterSpacing: 0.2,
    },
    accountForm: {
      gap: space.lg,
    },
    accountFieldGroup: {
      gap: space.xs,
    },
    accountLabel: {
      ...type.eyebrow,
      color: colors.secondary,
    },
    accountInput: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      paddingHorizontal: space.lg,
      paddingVertical: space.md + 2,
      fontSize: 16,
      lineHeight: 22,
      color: colors.primary,
      fontFamily: fonts.body.regular,
      borderWidth: 1,
      borderColor: colors.border,
    },
    accountFinePrint: {
      ...type.caption,
      color: colors.tertiary,
      lineHeight: 18,
    },
    signInLink: {
      marginTop: space.xl,
      alignSelf: "center",
      paddingVertical: space.sm,
    },
    signInLinkText: {
      ...type.bodySmall,
      color: colors.secondary,
      textAlign: "center",
    },
    signInLinkAccent: {
      fontFamily: fonts.body.medium,
      color: colors.primary,
    },
  });
}
