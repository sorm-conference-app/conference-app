import { Image } from 'expo-image';
import { Platform, StyleSheet, useWindowDimensions } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const logoWidth = Math.min(width, 500); // Maximum width of 500, but will shrink if screen is smaller
  const logoHeight = (182 / 500) * logoWidth; // Maintain aspect ratio

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#ECEDEE' }}
      headerImage={
        <Image
          source={require('@/assets/images/sorm-logo.png')}
          style={[styles.sormLogo, { width: logoWidth, height: logoHeight }]}
          contentFit="contain"
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText>
          Welcome to the SORM Symposium. From here you can view the event schedule, speakers, and more.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText>
          Use the tabs at the bottom of the screen to navigate to the different pages.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  sormLogo: {
    bottom: 5,
    left: 0,
    position: 'absolute',
  },
});
