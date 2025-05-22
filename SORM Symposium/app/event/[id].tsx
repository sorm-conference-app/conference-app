import { StyleSheet, Linking } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import React from "react";

type Speaker = {
  name: string;
  title: string;
  bio: string;
};

type BaseEvent = {
  title: string;
  time: string;
  location: string;
  description: string;
  type: "registration" | "presentation" | "break";
};

type PresentationEvent = BaseEvent & {
  type: "presentation";
  speaker: Speaker;
  slides: string;
};

type Event = BaseEvent | PresentationEvent;

type EventDatabase = {
  [key: string]: Event;
};

// This would typically come from an API or database
const eventDetails: EventDatabase = {
  "1": {
    title: "Welcome and Registration",
    time: "8:00 AM - 9:00 AM",
    location: "Main Hall",
    description:
      "Start your day by checking in at the registration desk. Pick up your conference materials and enjoy some morning refreshments while networking with fellow attendees.",
    type: "registration",
  },
  "2": {
    title: "Opening Keynote",
    time: "9:00 AM - 10:30 AM",
    location: "Auditorium A",
    description:
      "Join us for an inspiring keynote address that will set the tone for our symposium.",
    speaker: {
      name: "Dr. Jane Smith",
      title: "Director of Risk Management, State Office",
      bio: "Dr. Smith has over 20 years of experience in risk management and policy development.",
    },
    slides: "https://example.com/slides/keynote",
    type: "presentation",
  },
  "3": {
    title: "Break",
    time: "10:30 AM - 11:00 AM",
    location: "Networking Area",
    description:
      "Refresh yourself with coffee, tea, and light snacks while networking with other attendees.",
    type: "break",
  },
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const event = eventDetails[id as keyof typeof eventDetails];

  if (!event) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: "Event Not Found" }} />
        <ThemedText>Event not found.</ThemedText>
      </ThemedView>
    );
  }

  const isPresentationEvent = (event: Event): event is PresentationEvent => {
    return event.type === "presentation";
  };

  const openSlides = async () => {
    if (isPresentationEvent(event)) {
      await Linking.openURL(event.slides);
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
            <IconSymbol name="clock.fill" size={20} color="#666" />
            <ThemedText style={styles.infoText}>{event.time}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoRow}>
            <IconSymbol name="mappin.circle.fill" size={20} color="#666" />
            <ThemedText style={styles.infoText}>{event.location}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">About</ThemedText>
          <ThemedText style={styles.description}>
            {event.description}
          </ThemedText>
        </ThemedView>

        {isPresentationEvent(event) && (
          <>
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle">Speaker</ThemedText>
              <ThemedText type="defaultSemiBold">
                {event.speaker.name}
              </ThemedText>
              <ThemedText>{event.speaker.title}</ThemedText>
              <ThemedText style={styles.bio}>{event.speaker.bio}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.section}>
              <ThemedText type="link" onPress={openSlides}>
                View Presentation Slides
              </ThemedText>
            </ThemedView>
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
