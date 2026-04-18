import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Compass,
  Search,
  BookOpen,
  User,
} from "lucide-react-native";
import { DiscoveryScreen } from "../screens/DiscoveryScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { MyLibraryScreen } from "../screens/MyLibraryScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { MiniPlayer } from "../components/MiniPlayer";
import { useAppSelector } from "../hooks";
import { Fonts } from "../constants/typography";

const Tab = createBottomTabNavigator();

export function MainTabs({ onExpandPlayer }: { onExpandPlayer: () => void }) {
  const currentAudiobook = useAppSelector((state) => state.player.currentAudiobook);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            currentAudiobook ? styles.tabBarWithPlayer : null,
          ],
          tabBarActiveTintColor: "#000",
          tabBarInactiveTintColor: "#999",
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
                <Compass
                  size={24}
                  color={color}
                  strokeWidth={focused ? 2 : 1.5}
                />
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
                <Search
                  size={24}
                  color={color}
                  strokeWidth={focused ? 2 : 1.5}
                />
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
                <BookOpen
                  size={24}
                  color={color}
                  strokeWidth={focused ? 2 : 1.5}
                />
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
                <User
                  size={24}
                  color={color}
                  strokeWidth={focused ? 2 : 1.5}
                />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
      <MiniPlayer onExpand={onExpandPlayer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    height: 85,
    paddingTop: 8,
    paddingBottom: 28,
  },
  tabBarWithPlayer: {
    marginBottom: 0,
  },
  tabLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    marginTop: 4,
  },
  tabItem: {
    paddingTop: 4,
  },
  iconActive: {
    transform: [{ scale: 1.05 }],
  },
});
