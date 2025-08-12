import {
  formatTopicName,
  getTopicColor,
} from "@/components/AgendaViewer/utils";
import DownloadPresentationButton from "@/components/DownloadPresentationButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { formatDate, formatTimeRange } from "@/lib/dateTime";
import { getEventById } from "@/services/events";
import type { Event } from "@/types/Events.types";
import { formatSpeakersForDisplay } from "@/lib/speakerUtils";
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

  const topicColor = getTopicColor(event.topic);
  const topicName = formatTopicName(event.topic);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: event.title }} />
      <ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.title}>
          {event.title}
        </ThemedText>

        {/* Topic Badge */}
        <ThemedView
          style={[styles.topicBadge, { backgroundColor: topicColor }]}
        >
          <ThemedText style={styles.topicText}>{topicName}</ThemedText>
        </ThemedView>

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

          {!event.title.includes("Break") ? (
            <ThemedView style={styles.infoRow}>
              <IconSymbol
                name="mappin.circle.fill"
                size={20}
                color={Colors[colorScheme].tabIconDefault}
              />
              <ThemedText style={styles.infoText}>{event.location}</ThemedText>
            </ThemedView>
          ) : null}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">About</ThemedText>
          <ThemedText style={styles.description}>
            {event.description || "No description available."}
          </ThemedText>
        </ThemedView>

        {(() => {
          const speakerNames = event.speaker_name;
          const speakerTitles = event.speaker_title;
          const speakerBios = event.speaker_bio;
          const speakerCompanies = event.speaker_company;

          if (speakerNames && speakerNames.length > 0) {
            return (
              <>
                <ThemedView style={styles.section}>
                  <ThemedText type="subtitle">
                    {speakerNames.length === 1 ? "Speaker" : "Speakers"}
                  </ThemedText>
                  {speakerNames.map((name, index) => (
                    <ThemedView key={index} style={styles.speakerInfo}>
                      <ThemedText type="defaultSemiBold">{name}</ThemedText>
                      {(speakerTitles &&
                        speakerTitles[index] &&
                        speakerCompanies &&
                        speakerCompanies[index] && (
                          <ThemedText>
                            {speakerTitles[index]} at {speakerCompanies[index]}
                          </ThemedText>
                        )) ||
                        (speakerTitles && speakerTitles[index] ? (
                          <ThemedText>{speakerTitles[index]}</ThemedText>
                        ) : null) ||
                        (speakerCompanies && speakerCompanies[index] && (
                          <ThemedText style={styles.company}>
                            {speakerCompanies[index]}
                          </ThemedText>
                        ))}
                      {speakerBios && speakerBios[index] && (
                        <ThemedText style={styles.bio}>
                          {speakerBios[index]}
                        </ThemedText>
                      )}
                    </ThemedView>
                  ))}
                </ThemedView>

                {!event.slides_url && (
                  <DownloadPresentationButton eventId={event.id} />
                )}
              </>
            );
          }
          return null;
        })()}
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
  topicBadge: {
    alignSelf: "flex-start",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  topicText: {
    color: "black",
    fontSize: 14,
    fontWeight: "600",
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
  company: {
    marginTop: 4,
    fontStyle: "italic",
  },
  speakerInfo: {
    gap: 4,
    marginBottom: 12,
  },
});
