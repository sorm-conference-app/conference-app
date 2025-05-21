import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';

export function useTabBarStyle(colorScheme: 'light' | 'dark'): BottomTabNavigationOptions {
  const insets = useSafeAreaInsets();

  return {
    tabBarActiveTintColor: Colors[colorScheme].tint,
    tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
    headerShown: false,
    tabBarStyle: {
      backgroundColor: Colors[colorScheme].tabBarBackground,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme].icon,
      height: Platform.select({
        ios: 60 + insets.bottom,
        android: 60 + insets.bottom,
        default: 60,
      }),
      paddingBottom: Platform.select({
        ios: 8 + insets.bottom,
        default: 8,
      }),
      paddingTop: 8,
      position: 'absolute',
      bottom: Platform.select({
        android: -insets.bottom,
        default: 0,
      }),
    },
    tabBarItemStyle: {
      backgroundColor: 'transparent',
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '500' as const,
    },
  };
} 