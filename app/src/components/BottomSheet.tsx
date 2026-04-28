import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { useTheme } from "../theme";
import type { AppTheme } from "../theme";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.header}>
            <View style={styles.handle} />
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={22} color={theme.colors.primary} strokeWidth={1.8} />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, type, space, radius, shadows, fonts } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.scrim,
    },
    sheet: {
      backgroundColor: colors.bgRaised,
      borderTopLeftRadius: radius.xxl,
      borderTopRightRadius: radius.xxl,
      minHeight: 200,
      maxHeight: "85%",
      ...shadows.floating.native,
    },
    header: {
      alignItems: "center",
      paddingTop: space.sm,
      paddingHorizontal: space.lg,
      paddingBottom: space.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginBottom: space.md,
    },
    title: {
      ...type.sectionLabel,
      fontFamily: fonts.body.medium,
      fontSize: 16,
      color: colors.primary,
    },
    closeButton: {
      position: "absolute",
      right: space.md,
      top: space.lg,
      padding: 4,
    },
    content: {
      padding: space.lg,
    },
  });
}
