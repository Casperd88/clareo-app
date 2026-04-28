import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../hooks";
import { login, clearError } from "../store/authSlice";
import { Logo } from "../components/Logo";
import {
  AuthSplitLayout,
  useIsAuthSplitLayout,
} from "../components/AuthSplitLayout";
import { useTheme } from "../theme";
import type { AppTheme } from "../theme";

interface AuthScreenProps {
  onCreateAccount?: () => void;
}

export function AuthScreen({ onCreateAccount }: AuthScreenProps = {}) {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isSplitLayout = useIsAuthSplitLayout();

  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async () => {
    if (!email || !password) return;
    await dispatch(login({ email, password }));
  };

  const handleCreateAccount = () => {
    dispatch(clearError());
    onCreateAccount?.();
  };

  const authContent = (
    <>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Logo width={56} color={theme.colors.primary} />
        </View>

        <Text style={styles.eyebrow}>Welcome back</Text>
        <Text style={styles.title}>
          Pick up{"\n"}
          <Text style={styles.titleAccent}>where you left off.</Text>
        </Text>
        <Text style={styles.subtitle}>
          Sign in to keep your place across every device.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={theme.colors.tertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.tertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading || !email || !password}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.primaryInverse} />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleCreateAccount}
          activeOpacity={0.7}
          disabled={!onCreateAccount}
        >
          <Text style={styles.secondaryButtonText}>
            New here? Create an account
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Text>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <AuthSplitLayout>
          <ScrollView
            style={isSplitLayout ? styles.desktopFormScroll : undefined}
            contentContainerStyle={
              isSplitLayout
                ? styles.desktopFormScrollContent
                : styles.scrollContent
            }
            keyboardShouldPersistTaps="handled"
          >
            {authContent}
          </ScrollView>
        </AuthSplitLayout>
      </KeyboardAvoidingView>
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
    keyboardView: {
      flex: 1,
    },
    desktopFormScroll: {
      flex: 1,
    },
    desktopFormScrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: space.xxl,
      paddingVertical: space.xxxl,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: space.xl,
      paddingVertical: space.xxxl,
      ...Platform.select({
        web: { alignItems: "center" as const },
        default: {},
      }),
    },
    header: {
      alignItems: "flex-start",
      marginBottom: space.xxxl,
      width: "100%",
      ...Platform.select({
        web: { maxWidth: 480, alignSelf: "center" as const },
        default: {},
      }),
    },
    logoContainer: {
      marginBottom: space.xl,
    },
    eyebrow: {
      ...type.eyebrow,
      color: colors.secondary,
      marginBottom: space.sm,
    },
    title: {
      ...type.display,
      color: colors.primary,
      marginBottom: space.md,
    },
    titleAccent: {
      ...type.displayItalic,
      color: colors.primary,
      fontFamily: fonts.display.italic,
    },
    subtitle: {
      ...type.bodyLarge,
      color: colors.secondary,
      maxWidth: 420,
      marginBottom: space.lg,
    },
    form: {
      width: "100%",
      ...Platform.select({
        web: {
          maxWidth: 480,
          alignSelf: "center" as const,
          flexShrink: 0,
        },
        default: {},
      }),
    },
    inputContainer: {
      marginBottom: space.lg,
    },
    label: {
      ...type.eyebrow,
      color: colors.secondary,
      marginBottom: space.xs,
    },
    input: {
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
    errorContainer: {
      backgroundColor: "rgba(214, 70, 58, 0.10)",
      borderRadius: radius.md,
      padding: space.sm + 2,
      marginBottom: space.lg,
      borderWidth: 1,
      borderColor: "rgba(214, 70, 58, 0.18)",
    },
    errorText: {
      color: colors.danger,
      fontSize: 14,
      textAlign: "center",
      fontFamily: fonts.body.regular,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: radius.pill,
      paddingVertical: space.md + 2,
      paddingHorizontal: space.xl,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: space.md,
      ...shadows.floating.native,
    },
    buttonDisabled: {
      opacity: 0.55,
    },
    buttonText: {
      color: colors.primaryInverse,
      fontFamily: fonts.body.medium,
      fontSize: 16,
      letterSpacing: 0.2,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: space.lg,
    },
    dividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.secondary,
      paddingHorizontal: space.md,
      fontSize: 13,
      fontFamily: fonts.body.regular,
      letterSpacing: 0.4,
    },
    secondaryButton: {
      alignItems: "center",
      paddingVertical: space.sm,
    },
    secondaryButtonText: {
      color: colors.primary,
      fontFamily: fonts.body.medium,
      fontSize: 15,
    },
    footer: {
      textAlign: "center",
      color: colors.tertiary,
      fontSize: 12,
      marginTop: space.xxl,
      lineHeight: 18,
      fontFamily: fonts.body.regular,
      ...Platform.select({
        web: { maxWidth: 480, alignSelf: "center" as const, width: "100%" },
        default: {},
      }),
    },
  });
}
