import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { formatTimeRange } from "@/lib/dateTime";
import { useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet } from "react-native";
import AgendaItemSaveButton from "./AgendaItemSaveButton";
import { formatTopicName, getTopicColor } from "./utils";

type AgendaItemProps = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  isDeleted: boolean;
  topic?: string | null;
  hasRSVP: boolean;
  height: number;
  onPress: () => void;
  setRsvpEventIds: () => void;
};

export default function AgendaItem({
  id,
  title,
  startTime,
  endTime,
  location,
  isDeleted,
  topic,
  hasRSVP,
  height,
  setRsvpEventIds,
  onPress,
}: AgendaItemProps) {
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;
  const topicColor = getTopicColor(topic ?? null);
  const topicName = formatTopicName(topic ?? null);
  const isAdmin = useIsAdmin();
  const [containerWidth, setContainerWidth] = useState(0);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.agendaItem,
        { backgroundColor: topicColor },
        { borderColor: Colors[colorScheme].tint },
        {
          minHeight: height,
        },
        pressed && styles.agendaItemPressed,
      ]}
      onPress={onPress}
    >
      <ThemedView
        style={[
          styles.agendaContent,
          {
            backgroundColor:
              colorScheme === "light"
                ? Colors[colorScheme].background
                : Colors[colorScheme].background,
          },
        ]}
      >
        <ThemedView style={styles.titleRow}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText 
              style={styles.title} 
              type="defaultSemiBold"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title}
            </ThemedText>
            {isDeleted && (
              <ThemedText style={styles.deletedTitle} type="defaultSemiBold">
                {" "}
                - Deleted
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>
        {/* Topic Badge */}
        {topicName !== "Break" && (
          <ThemedView
            style={[styles.topicBadge, { backgroundColor: topicColor }]}
          >
            <ThemedText style={styles.topicText}>{topicName}</ThemedText>
          </ThemedView>
        )}
        <ThemedView style={styles.infoRow}>
          <IconSymbol name="clock.fill" size={16} color={tintColor} />
          <ThemedView 
            style={styles.timeContainer}
            onLayout={(event: LayoutChangeEvent) => {
              setContainerWidth(event.nativeEvent.layout.width);
            }}
          >
            {(() => {
              const timeRange = formatTimeRange(startTime, endTime);
              const parts = timeRange.split(' - ');
              
              // If start and end times are the same, show just the start time
              if (parts[0] === parts[1]) {
                return <ThemedText style={styles.time}>{parts[0]}</ThemedText>;
              }
              // If container is narrow (less than ~120px), wrap at dash
              // Otherwise, keep on one line
              if (parts.length === 2 && containerWidth < 150) {
                return (
                  <>
                    <ThemedText style={styles.time}>{parts[0]} -</ThemedText>
                    <ThemedText style={styles.time}>{parts[1]}</ThemedText>
                  </>
                );
              }
              return <ThemedText style={styles.time}>{timeRange}</ThemedText>;
            })()}
          </ThemedView>
        </ThemedView>
        {topicName !== "Break" && (
          <ThemedView style={styles.infoRow}>
            <IconSymbol name="mappin.circle.fill" size={16} color={tintColor} />
            <ThemedText style={styles.location}>{location}</ThemedText>
          </ThemedView>
        )}
        {!isAdmin && (
          <ThemedView style={styles.saveButton}>
            <AgendaItemSaveButton
              eventId={id}
              isRSVP={hasRSVP}
              setRsvpEventIds={setRsvpEventIds}
            />
          </ThemedView>
          )}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  location: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    backgroundColor: "transparent",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  title: {
    marginBottom: 3,
  },
  deletedTitle: {
    color: "red",
    marginBottom: 3,
  },
  time: {
    flex: 1,
  },
  timeContainer: {
    flex: 1,
  },
  topicBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  topicText: {
    color: "black",
    fontSize: 12,
    fontWeight: "600",
  },
  agendaItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minWidth: 0,
    borderWidth: 1,
    borderColor: "white",
    flexDirection: "row",
    alignItems: "stretch",
    userSelect: "none",
  },
  agendaItemPressed: {
    opacity: 0.7,
  },
  topicBand: {
    flex: 1,
    borderRadius: 6,
    padding: 3,
  },
  agendaContent: {
    flex: 1,
    display: "flex",
    padding: 8,
    borderRadius: 3,
  },
  saveButton: {
    position: "absolute",
    padding: 4,
    right: 4,
    bottom: 4,
  },
});
