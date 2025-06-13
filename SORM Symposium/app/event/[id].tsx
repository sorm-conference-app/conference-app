import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { formatDate, formatTimeRange } from "@/lib/dateTime";
import { getEventById } from "@/services/events";
import type { Event } from "@/types/Events.types";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Linking, ScrollView, StyleSheet } from "react-native";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() ?? "light";

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await getEventById(Number(id));
        setEvent(eventData);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: "Loading..." }} />
        <ThemedText>Loading event details...</ThemedText>
      </ThemedView>
    );
  }

  if (!event) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: "Event Not Found" }} />
        <ThemedText>Event not found.</ThemedText>
      </ThemedView>
    );
  }

  const openSlides = async () => {
    if (event.slides_url) {
      await Linking.openURL(event.slides_url);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: event.title }} />
      <ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.title}>
          {event.title}
        </ThemedText>

        <ThemedView style={styles.infoSection}>
          <ThemedView style={styles.infoRow}>
            <IconSymbol
              name="calendar"
              size={20}
              color={Colors[colorScheme].tabIconDefault}
            />
            <ThemedText style={styles.infoText}>
              {formatDate(event.event_date)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoRow}>
            <IconSymbol
              name="clock.fill"
              size={20}
              color={Colors[colorScheme].tabIconDefault}
            />
            <ThemedText style={styles.infoText}>
              {formatTimeRange(event.start_time, event.end_time)}
            </ThemedText>
          </ThemedView>

          {event.title !== "Break" && <ThemedView style={styles.infoRow}>
            <IconSymbol
              name="mappin.circle.fill"
              size={20}
              color={Colors[colorScheme].tabIconDefault}
            />
            <ThemedText style={styles.infoText}>{event.location}</ThemedText>
          </ThemedView>}
        </ThemedView>

        {event.title !== "Break" && <ThemedView style={styles.section}>
          <ThemedText type="subtitle">About</ThemedText>
          <ThemedText style={styles.description}>
            {event.description || "No description available."}
          </ThemedText>
        </ThemedView>}

        {event.speaker_name && (
          <>
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle">Speaker</ThemedText>
              <ThemedText type="defaultSemiBold">
                {event.speaker_name}
              </ThemedText>
              {event.speaker_title && (
                <ThemedText>{event.speaker_title}</ThemedText>
              )}
              {event.speaker_bio && (
                <ThemedText style={styles.bio}>{event.speaker_bio}</ThemedText>
              )}
            </ThemedView>

            {event.slides_url && (
              <ThemedView style={styles.section}>
                <ThemedText type="link" onPress={openSlides}>
                  View Presentation Slides
                </ThemedText>
              </ThemedView>
            )}
          </>
        )}
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
  description: {
    marginTop: 8,
  },
  bio: {
    marginTop: 4,
  },
});
