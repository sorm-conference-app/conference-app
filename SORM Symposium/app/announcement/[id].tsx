import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAnnouncements } from "@/hooks/useAnnouncements";

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams();
  const { announcements } = useAnnouncements();
  
  // Find the announcement by ID (convert string id to number for comparison)
  const announcement = announcements.find((a) => a.id === parseInt(id as string, 10));

  if (!announcement) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: "Announcement Not Found" }} />
        <ThemedText>Announcement not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: announcement.title }} />
      <ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.title}>
          {announcement.title}
        </ThemedText>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Announcement</ThemedText>
          <ThemedText style={styles.body}>
            {announcement.body}
          </ThemedText>
        </ThemedView>
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
  title: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  infoSection: {
    padding: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    flex: 1,
  },
  section: {
    padding: 16,
    gap: 8,
  },
  body: {
    marginTop: 8,
    lineHeight: 20,
  },
}); 