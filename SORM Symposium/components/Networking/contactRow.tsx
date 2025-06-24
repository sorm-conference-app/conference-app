import { Attendee } from "@/services/attendees";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { Dimensions, Pressable, StyleSheet, Platform } from "react-native";
import { useEffect, useState } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

interface ContactRowProps {
  attendee: Attendee;
}

const BREAKPOINT = 750;

export default function ContactRow({ attendee }: ContactRowProps) {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const isWideScreen = screenWidth > BREAKPOINT;
  const [isSelected, setIsSelected] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  return (
    <ThemedView style={[styles.container, { 
        backgroundColor: colorScheme === 'light' ? Colors[colorScheme].background : Colors[colorScheme].secondaryBackgroundColor,
      }]}>
      {isSelected ? (
        <Pressable style={styles.contactCard} onPress={() => setIsSelected(false)}>
          <ThemedText style={styles.name}>{attendee.name}</ThemedText>
          <ThemedText style={styles.details}>
            {attendee.title} <ThemedText style={styles.italicText}>at</ThemedText> {attendee.organization}
          </ThemedText>
          {attendee.email && <ThemedText style={styles.email}>{attendee.email}</ThemedText>}
          {attendee.additional_info && <ThemedText style={styles.additionalInfo}>{attendee.additional_info}</ThemedText>}
        </Pressable>
      ) : isWideScreen ? (
        <Pressable style={styles.contactRowWide} onPress={() => setIsSelected(true)}>
          <ThemedText style={styles.name}>{attendee.name}</ThemedText>
          <ThemedText style={styles.rowDetails}>
            {attendee.title} <ThemedText style={styles.italicText}>at</ThemedText> {attendee.organization}
          </ThemedText>
        </Pressable>
      ) : (
        <Pressable style={styles.contactRowNarrow} onPress={() => setIsSelected(true)}>
          <ThemedText style={styles.name}>{attendee.name}</ThemedText>
          <ThemedText style={styles.rowDetails}>
            {attendee.title} <ThemedText style={styles.italicText}>at</ThemedText> {attendee.organization}
          </ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: "gray",
    height: "auto",
  },
  contactCard: {
    position: "relative",
    flexDirection: "column",
    padding: 15,
    flexShrink: 0,
  },
  contactRowNarrow: {
    position: "relative",
    flexDirection: "column",
    padding: 15,
  },
  contactRowWide: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    marginBottom: 2,
    flexWrap: "wrap",
  },
  rowDetails: {
    fontSize: 14,
    marginBottom: 2,
    textAlign: "right",
  },
  email: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  additionalInfo: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
    flexWrap: "wrap",
  },
  italicText: {
    fontSize: 12,
    fontStyle: "italic",
  },
});