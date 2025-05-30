import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, useColorScheme, View } from "react-native";

import { Announcement } from "@/components/Announcement";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { Stack } from "expo-router";

import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useCallback } from "react";

export default function AnnouncementsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const { announcements, loading, error, refresh } = useAnnouncements();

  const renderContent = useCallback(() => {
    if (loading && announcements.length === 0) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        </View>
      );
    }

    if (error && announcements.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            Could not load announcements. Please try again.
          </ThemedText>
          <ThemedText 
            style={[styles.retryText, { color: Colors[colorScheme].tint }]}
            onPress={refresh}
          >
            Tap to retry
          </ThemedText>
        </View>
      );
    }

    if (announcements.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            No announcements available.
          </ThemedText>
        </View>
      );
    }

    return announcements.map((announcement) => (
      <Announcement
        key={announcement.id}
        title={announcement.title}
        body={announcement.body}
        useTruncation={false}
      />
    ));
  }, [announcements, loading, error, refresh, colorScheme]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[useColorScheme() ?? 'light'].secondaryBackgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Announcements",
          headerShown: true,
        }}
      />
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={loading && announcements.length > 0}
            onRefresh={refresh}
            colors={[Colors[colorScheme].tint]}
            tintColor={Colors[colorScheme].tint}
          />
        }
      >
        <View style={styles.content}>
          {renderContent()}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  retryText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
}); 