import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import useSupabaseAuth from "@/hooks/useSupabaseAuth";

export default function TabLayout() {
  const user = useSupabaseAuth();

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor:
          Colors[useColorScheme() ?? "light"].tabIconSelected,
        tabBarInactiveTintColor:
          Colors[useColorScheme() ?? "light"].tabIconDefault,
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "bold",
        },
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
        name="home"
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
          href: user ? "/(tabs)/admin" : null,
          title: "Admin",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.fill" color={color} size={28} />
          ),
        }}
      />
    </Tabs>
  );
}
