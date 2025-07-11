import { Announcement } from "@/components/Announcement";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import SormImageWrapper from "@/components/SormImageWrapper";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/constants/supabase";
import useAnnouncements from "@/hooks/useAnnouncements";
import { useColorScheme } from "@/hooks/useColorScheme";
import { clearVerifiedEmails } from "@/lib/attendeeStorage";
import { onSurveyFlash, triggerSurveyFlash } from "@/lib/surveyFlashEmitter";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

export default function Home() {
  const navigateToAllAnnouncements = () => {
    router.push("/announcement/announcementList");
  };

  /**
   * Handle logout functionality
   * - Log out any users from Supabase
   * - Clear verified emails from local storage
   * - Redirect to login page for all users
   */
  const handleLogout = async () => {
    try {
      // Clear verified emails from local storage
      await clearVerifiedEmails();
      // Log out any admin users from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    }

    // Redirect to login page (index.tsx) for all users
    router.replace("/");
  };

  const WIDE_SCREEN_WIDTH = 950;
  const [wideScreen, setWideScreen] = useState(false);
  const [surveyFlashTrigger, setSurveyFlashTrigger] = useState(0);
  const surveyAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const updateLayout = () => {
      setWideScreen(Dimensions.get("window").width > WIDE_SCREEN_WIDTH);
    };

    updateLayout();
    const subscription = Dimensions.addEventListener("change", updateLayout);

    return () => {
      subscription.remove();
    };
  }, []);

  // Listen for survey flash events
  useEffect(() => {
    const cleanup = onSurveyFlash(() => {
      setSurveyFlashTrigger(prev => prev + 1);
    });

    return cleanup;
  }, []);

  // Trigger flash animation when surveyFlashTrigger changes
  useEffect(() => {
    if (surveyFlashTrigger > 0) {
      Animated.sequence([
        Animated.timing(surveyAnimation, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(surveyAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [surveyFlashTrigger, surveyAnimation]);

  const surveyContainer = () => {
    return (
      <Animated.View style={[styles.surveyButtonContainer, 
        { position: wideScreen ? "absolute" : "relative",
          backgroundColor: Colors[colorScheme].secondaryBackgroundColor,
          borderColor: Colors[colorScheme].tint,
          transform: [{ scale: surveyAnimation }],
        }]}>
        <ThemedText style={{ marginRight: 90, color: Colors[colorScheme].text }}>
          Your feedback is important to us! Please take a moment to fill out our survey about the day's events.
        </ThemedText>
        <Pressable 
          onPress={() => {}}
          style={[styles.surveyButton,
            { backgroundColor: Colors[colorScheme].adminButton },
            { borderColor: Colors[colorScheme].tint },
          ]}>
          <ThemedText style={[styles.surveyButtonText, 
            { color: Colors[colorScheme].adminButtonText, }]}>
              Go to Survey</ThemedText>
        </Pressable>
      </Animated.View>
    );
  };

  const colorScheme = useColorScheme() ?? "light";
  const {
    data: announcements = [],
    isFetching: loading,
    error,
    refetch: refresh,
  } = useAnnouncements(3);

  const renderAnnouncementContent = useCallback(() => {
    function refetchAnnouncements() {
      refresh();
    }
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
          <ThemedText type="link" onPress={refetchAnnouncements} style={styles.retryLink}>
            Retry
          </ThemedText>
        </View>
      );
    }

    if (announcements.length === 0) {
      return (
        <ThemedText style={{ textAlign: "center" }}>
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
    <SormImageWrapper>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to the SORM{"\u00A0"}Symposium!</ThemedText>
      </ThemedView>
      {surveyContainer()}
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
      <ThemedView
        style={[
          styles.announcementContainer,
          {
            backgroundColor: Colors[colorScheme].secondaryBackgroundColor,
            borderColor: Colors[colorScheme].text,
          },
        ]}
      >
        <ThemedText type="subtitle" style={[{ textAlign: "center" }]}>
          Latest Announcements
        </ThemedText>
        <ThemedText style={[{ textAlign: "center" }]}>
          {Platform.OS === "web"
            ? "Click to expand/collapse"
            : "Tap to expand/collapse"}
        </ThemedText>

        {renderAnnouncementContent()}

        <View
          style={[
            styles.linkContainer,
            {
              borderColor: Colors[colorScheme].tint,
              backgroundColor: Colors[colorScheme].background,
            },
          ]}
        >
          <ThemedText
            type="link"
            onPress={navigateToAllAnnouncements}
            style={[styles.viewAllLink, { color: Colors[colorScheme].text }]}
          >
            View all announcements
          </ThemedText>
        </View>
      </ThemedView>

      {/* Footer with auth buttons */}
      <ThemedView style={styles.footerContainer}>
        <View
          style={[
            styles.linkContainer,
            {
              borderColor: Colors[colorScheme].tint,
              backgroundColor: Colors[colorScheme].background,
            },
          ]}
        >
          <ThemedText
            type="link"
            onPress={handleLogout}
            style={[styles.viewAllLink, { color: Colors[colorScheme].text }]}
          >
            Logout
          </ThemedText>
        </View>
      </ThemedView>
    </SormImageWrapper>
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
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingBottom: 4,
    borderWidth: 1,
    borderRadius: 12,
  },
  viewAllLink: {
    marginTop: 4,
    textAlign: "center",
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  errorContainer: {
    alignItems: "center",
    padding: 12,
  },
  errorText: {
    marginBottom: 8,
    textAlign: "center",
  },
  retryLink: {
    textAlign: "center",
  },
  footerContainer: {
    padding: 12,
    marginTop: 16,
    alignItems: "center",
  },
  surveyButtonContainer: {
    position: "relative",
    flexDirection: "column",
    right: 5,
    maxWidth: 350,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    zIndex: 1,
  },
  surveyButton: {
    position: "absolute",
    height: 67,
    width: 90,
    top: 10,
    right: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 10,
  },
  surveyButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
});
