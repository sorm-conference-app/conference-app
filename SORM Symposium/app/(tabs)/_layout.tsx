import { HapticTab } from "@/components/HapticTab";
import { useLoginFlow } from "@/components/LoginFlowProvider";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import { Tabs } from "expo-router";
import { Platform, useColorScheme } from "react-native";

export default function TabLayout() {
  const user = useSupabaseAuth();
  const isAdmin = useIsAdmin();
  const { loginFlow } = useLoginFlow();
  
  // Only show admin tab if user is authenticated, has admin role, came through organizer login flow, AND is on web platform
  const shouldShowAdminTab = user && isAdmin && loginFlow === 'organizer' && Platform.OS === 'web';

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
        name="info"
        options={{
          title: "Info",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="info.circle.fill" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          title: "Connect",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.2.fill" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="sponsors"
        options={{
          title: "Sponsors",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="star.fill" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          href: shouldShowAdminTab ? "/(tabs)/admin" : null,
          title: "Admin",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.fill" color={color} size={28} />
          ),
        }}
      />
    </Tabs>
  );
}
