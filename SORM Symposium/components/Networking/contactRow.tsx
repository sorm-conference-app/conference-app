import { Attendee } from "@/services/attendees";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { Dimensions, Pressable, StyleSheet, Platform } from "react-native";
import { useEffect, useState } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

interface ContactRowProps {
  attendee: Attendee;
  expandedRowId: number | null;
  setExpandedRow: (rowId: number | null) => void;
}

const BREAKPOINT = 750;

export default function ContactRow({ attendee, expandedRowId, setExpandedRow }: ContactRowProps) {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const isWideScreen = screenWidth > BREAKPOINT;
  const colorScheme = useColorScheme() ?? 'light';

  // Check if this row is currently expanded
  const isSelected = expandedRowId === attendee.id;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  const handlePress = () => {
    if (isSelected) {
      setExpandedRow(null); // Close this row
    } else {
      setExpandedRow(attendee.id); // Expand this row
    }
  };

  const position = (
    isSelected ? (
      <ThemedText style={styles.details}>
        {attendee.title && <>{attendee.title}</>}
        {attendee.title && attendee.organization && <ThemedText style={styles.italicText}> at </ThemedText>}
        {attendee.organization && <>{attendee.organization}</>}
      </ThemedText>
    ) : (
      <ThemedText style={styles.rowDetails}>
        {attendee.title && <>{attendee.title}</>}
        {attendee.title && attendee.organization && <ThemedText style={styles.italicText}> at </ThemedText>}
        {attendee.organization && <>{attendee.organization}</>}
      </ThemedText>
    )
  )

  return (
    <ThemedView style={[styles.container, { 
        backgroundColor: colorScheme === 'light' ? Colors[colorScheme].background : Colors[colorScheme].secondaryBackgroundColor,
      }]}>
      {isSelected ? (
        <Pressable style={styles.contactCard} onPress={handlePress}>
          <>
            <ThemedText style={styles.name}>{attendee.name}</ThemedText>
            {position}
            {attendee.email && <ThemedText style={styles.email}>{attendee.email}</ThemedText>}
            {attendee.additional_info && attendee.additional_info.length > 0 &&
              <ThemedText style={styles.additionalInfo}>{attendee.additional_info}</ThemedText>
            }
          </>
        </Pressable>
      ) : (
        <Pressable style={isWideScreen ? styles.contactRowWide : styles.contactRowNarrow} onPress={handlePress}>
          <ThemedText style={styles.name}>{attendee.name}</ThemedText>
          {position}
        </Pressable>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "gray",
    minHeight: "auto",
    overflow: "visible",
  },
  contactCard: {
    position: "relative",
    flexDirection: "column",
    padding: 15,
    flexShrink: 0,
    minHeight: "auto",
  },
  contactRowNarrow: {
    position: "relative",
    flexDirection: "column",
    padding: 15,
    minHeight: "auto",
  },
  contactRowWide: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 15,
    minHeight: "auto",
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