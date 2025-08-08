import { HapticTab } from "@/components/HapticTab";
import { useLoginFlow } from "@/components/LoginFlowProvider";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import { Tabs } from "expo-router";
import { Platform, useColorScheme, useWindowDimensions } from "react-native";

export default function TabLayout() {
  const user = useSupabaseAuth();
  const isAdmin = useIsAdmin();
  const { loginFlow } = useLoginFlow();
  const windowWidth = useWindowDimensions().width;
  
  // Only show admin tab if user is authenticated, has admin role, came through organizer login flow, AND is on web platform
  const shouldShowAdminTab = user && isAdmin && loginFlow === 'organizer' && Platform.OS === 'web';

  const WIDTH_THRESHOLD = shouldShowAdminTab ? 420 : 350;

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
            android: { paddingBottom: 0, height: 60 },
            default: { height: windowWidth > WIDTH_THRESHOLD ? 55 : 55, paddingTop: windowWidth > WIDTH_THRESHOLD ? 0 : 8 },
          }),
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarLabel: windowWidth > WIDTH_THRESHOLD ? "Home" : "",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="house.fill" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",
          tabBarLabel: windowWidth > WIDTH_THRESHOLD ? "Agenda" : "",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="calendar" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: "Info",
          tabBarLabel: windowWidth > WIDTH_THRESHOLD ? "Info" : "",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="info.circle.fill" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          title: "Connect",
          tabBarLabel: windowWidth > WIDTH_THRESHOLD ? "Connect" : "",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.2.fill" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="sponsors"
        options={{
          title: "Sponsors",
          tabBarLabel: windowWidth > WIDTH_THRESHOLD ? "Sponsors" : "",
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
          tabBarLabel: windowWidth > WIDTH_THRESHOLD ? "Admin" : "",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.fill" color={color} size={28} />
          ),
        }}
      />
    </Tabs>
  );
}
