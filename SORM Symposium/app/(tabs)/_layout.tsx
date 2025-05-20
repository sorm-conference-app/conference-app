import { Tabs } from "expo-router";
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from "react-native";
import { useTabBarStyle } from "@/components/ui/TabBarBackground";

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const screenOptions = useTabBarStyle(colorScheme);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="house.fill" color={color} size={28} />
          ),
        }}
      />
    </Tabs>
  );
}
