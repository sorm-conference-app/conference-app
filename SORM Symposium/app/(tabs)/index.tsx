import { Announcement } from "@/components/Announcement";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";

const width = () => Math.min(Dimensions.get("window").width, 500);
const height = () => (width() * 182) / 500;

export default function Index() {
  const navigateToAllAnnouncements = () => {
    router.push("/announcement/announcementList");
  };
  const colorScheme = useColorScheme() ?? 'light';
  const { announcements, loading, error, refresh } = useAnnouncements(3);

  const renderAnnouncementContent = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            Could not load announcements. Please try again.
          </ThemedText>
          <ThemedText 
            type="link" 
            onPress={refresh}
            style={styles.retryLink}
          >
            Retry
          </ThemedText>
        </View>
      );
    }

    if (announcements.length === 0) {
      return (
        <ThemedText style={{ textAlign: 'center' }}>
          No announcements available.
        </ThemedText>
      );
    }

    return (
      <>
        {announcements.map((announcement) => (
          <Announcement
            key={announcement.id}
            title={announcement.title}
            body={announcement.body}
            useTruncation={true}
          />
        ))}
      </>
    );
  }, [announcements, loading, error, refresh, colorScheme]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ dark: Colors.dark.tint, light: Colors.light.secondaryBackgroundColor }}
      headerImage={
        <Image
          source={require("@/assets/images/sorm-logo.png")}
          style={[styles.logoImage, { width: width(), height: height() }]}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to the SORM Symposium!</ThemedText>
      </ThemedView>
      <ThemedView style={styles.partContainer}>
        <ThemedText>
          The SORM Symposium will take place August 13-15 in College Station,
          Texas.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.partContainer}>
        <ThemedText>
          Here you will be able to find information on symposium events,
          speakers, and announcements. You can also find more info at{" "}
          <ExternalLink href="https://www.sorm.state.tx.us/continuity-council-events/sorm-symposium/">
            SORM&apos;s website
          </ExternalLink>
          .
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
        
        {renderAnnouncementContent()}
        
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
    flexDirection: "row",
    alignItems: "center",
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
    position: "absolute",
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
  loaderContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 12,
  },
  errorText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  retryLink: {
    textAlign: 'center',
  },
});