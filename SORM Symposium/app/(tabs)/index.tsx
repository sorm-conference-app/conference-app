import { StyleSheet, Dimensions, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ExternalLink } from "@/components/ExternalLink";
import { Image } from "expo-image";
import { Colors } from "@/constants/Colors";
import { Announcement } from "@/components/Announcement";
import { announcements } from "@/app/announcement/announcementList";
import { router } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";

const width = () => Math.min(Dimensions.get('window').width, 500);
const height = () => width() * 182 / 500;

export default function Index() {
  const navigateToAllAnnouncements = () => {
    router.push("/announcement/announcementList");
  };
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ dark: Colors.dark.tint, light: Colors.light.secondaryBackgroundColor }}
      headerImage={
        <Image 
          source={require('@/assets/images/sorm-logo.png')} 
          style={[styles.logoImage, { width: width(), height: height() }]}
        />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to the SORM Symposium!</ThemedText>
      </ThemedView>
      <ThemedView style={styles.partContainer}>
        <ThemedText>The SORM Symposium will take place August 13-15 in College Station, Texas.</ThemedText>
      </ThemedView>
      <ThemedView style={styles.partContainer}>
        <ThemedText>Here you will be able to find information on symposium events, speakers, and announcements.
          You can also find more info at <ExternalLink href="https://www.sorm.state.tx.us/continuity-council-events/sorm-symposium/">SORM's website</ExternalLink>.
        </ThemedText>
      </ThemedView>
      <ThemedView style={[
        styles.announcementContainer,
        { 
          backgroundColor: Colors[colorScheme].secondaryBackgroundColor,
          borderColor: Colors[colorScheme].text 
        }
      ]}>
        <ThemedText type="subtitle" style={[{ textAlign: 'center' }]}>Latest Announcements</ThemedText>
        <ThemedText style={[{ textAlign: 'center' }]}>Tap to expand/collapse</ThemedText>
        {announcements.slice(0, 3).map((announcement) => (
          <Announcement
            key={announcement.id}
            title={announcement.title}
            body={announcement.body}
            useTruncation={true}
          />
        ))}
        <View style={[
          styles.linkContainer,
          {
            borderColor: Colors[colorScheme].tint,
            backgroundColor: Colors[colorScheme].background
          }
        ]}>
          <ThemedText 
            type="link" 
            onPress={navigateToAllAnnouncements}
            style={[
              styles.viewAllLink,
              { color: Colors[colorScheme].text }
            ]}
          >
            View all announcements
          </ThemedText>
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  partContainer: {
    gap: 8,
    marginBottom: 8,
  },
  announcementContainer: {
    gap: 8,
    marginBottom: 8,
    padding: 8,
    borderRadius: 12,
    borderWidth: 3,
  },
  logoImage: {
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  linkContainer: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingBottom: 4,
    borderWidth: 1,
    borderRadius: 12,
  },
  viewAllLink: {
    marginTop: 4,
    textAlign: 'center',
  },
});