import type { PropsWithChildren, ReactElement } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
    interpolate,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollViewOffset,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  onImagePress?: () => void;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  onImagePress
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const headerAnimatedStyle = useAnimatedStyle(() => {
    // Guard against non-finite values on first static render which can occur
    // before the scroll view reports an offset on web/static export
    const y = Number.isFinite(scrollOffset.value) ? scrollOffset.value : 0;
    return {
      transform: [
        {
          translateY: interpolate(
            y,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(
            y,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1],
          ),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        <Pressable onPress={onImagePress}>
          <Animated.View
            style={[
              styles.header,
              { backgroundColor: headerBackgroundColor[colorScheme] },
              headerAnimatedStyle,
            ]}
          >
            {headerImage}
          </Animated.View>
        </Pressable>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    // Ensure absolutely-positioned children (e.g., the SORM logo) are
    // positioned relative to this header container on web/static export
    // where default positioning may differ on first paint
    position: "relative",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: "hidden",
  },
});
