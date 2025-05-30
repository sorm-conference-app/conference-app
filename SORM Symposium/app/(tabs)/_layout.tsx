import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: Colors[useColorScheme() ?? "light"].tabIconSelected,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          ...Platform.select({
            ios: { position: "absolute", bottom: 0 },
            default: {},
          }),
        },
      }}
    >
      <Tabs.Screen
        name="info"
        options={{
          title: "Info",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="info.circle.fill" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="house.fill" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="calendar" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.fill" color={color} size={28} />
          ),
        }}
      />
    </Tabs>
  );
}
