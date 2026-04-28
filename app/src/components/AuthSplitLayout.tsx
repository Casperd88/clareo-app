import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "../theme";

const visualSource = require("../../assets/auth-side-visual.png");

const DESKTOP_BREAKPOINT = 1100;

interface AuthSplitLayoutProps {
  children: React.ReactNode;
}

export function useIsAuthSplitLayout(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= DESKTOP_BREAKPOINT;
}

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  const theme = useTheme();
  const isSplit = useIsAuthSplitLayout();

  if (!isSplit) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.layout, { backgroundColor: theme.colors.bg }]}>
      <View
        style={[
          styles.visualPanel,
          {
            backgroundColor: theme.colors.bgRaised ?? theme.colors.bg,
            borderRightColor: theme.colors.border,
          },
        ]}
      >
        <Image
          source={visualSource}
          style={styles.visualImage}
          resizeMode="cover"
          accessibilityRole="image"
        />
      </View>
      <View style={styles.contentPane}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
  },
  visualPanel: {
    flex: 1,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  visualImage: {
    width: "100%",
    height: "100%",
  },
  contentPane: {
    flex: 1,
  },
});
