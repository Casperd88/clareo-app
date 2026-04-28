import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Compass, Search, BookOpen, User } from "lucide-react-native";
import { DiscoveryScreen } from "../screens/DiscoveryScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { MyLibraryScreen } from "../screens/MyLibraryScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { MiniPlayer } from "../components/MiniPlayer";
import { useAppSelector } from "../hooks";
import { useTheme } from "../theme";
import type { AppTheme } from "../theme";

const Tab = createBottomTabNavigator();

export function MainTabs({ onExpandPlayer }: { onExpandPlayer: () => void }) {
  const currentAudiobook = useAppSelector((state) => state.player.currentAudiobook);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            currentAudiobook ? styles.tabBarWithPlayer : null,
          ],
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.tertiary,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
        }}
      >
        <Tab.Screen
          name="Discover"
          component={DiscoveryScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.iconActive : undefined}>
                <Compass size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.iconActive : undefined}>
                <Search size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Library"
          component={MyLibraryScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.iconActive : undefined}>
                <BookOpen size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.iconActive : undefined}>
                <User size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
      <MiniPlayer onExpand={onExpandPlayer} />
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, fonts } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    tabBar: {
      backgroundColor: colors.bgRaised,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      height: 85,
      paddingTop: 8,
      paddingBottom: 28,
    },
    tabBarWithPlayer: {
      marginBottom: 0,
    },
    tabLabel: {
      fontFamily: fonts.body.medium,
      fontSize: 11,
      letterSpacing: 0.2,
      marginTop: 4,
    },
    tabItem: {
      paddingTop: 4,
    },
    iconActive: {
      transform: [{ scale: 1.05 }],
    },
  });
}
