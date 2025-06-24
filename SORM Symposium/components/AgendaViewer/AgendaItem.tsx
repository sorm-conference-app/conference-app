import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import { formatTimeRange } from "@/lib/dateTime";
import { Dispatch, SetStateAction } from "react";
import { Pressable, StyleSheet } from "react-native";
import AgendaItemSaveButton from "./AgendaItemSaveButton";
import { calculateHeight, formatTopicName, getTopicColor } from "./utils";

type AgendaItemProps = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  isDeleted: boolean;
  topic?: string | null;
  hasRSVP: boolean;
  onPress: () => void;
  setRsvpEventIds: Dispatch<SetStateAction<Set<number>>>;
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
  setRsvpEventIds,
  onPress,
}: AgendaItemProps) {
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;
  const topicColor = getTopicColor(topic ?? null);
  const topicName = formatTopicName(topic ?? null);
  const user = useSupabaseAuth();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.agendaItem,
        { backgroundColor: topicColor },
        { borderColor: Colors[colorScheme].tint },
        {
          minHeight:
            title === "Break" ? 65 : calculateHeight(startTime, endTime),
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
            <ThemedText style={styles.title} type="defaultSemiBold">
              {title}
            </ThemedText>
            {isDeleted && (
              <ThemedText style={styles.deletedTitle} type="defaultSemiBold">
                {" "}
                - Deleted
              </ThemedText>
            )}
            <IconSymbol name="chevron.right" size={20} color={tintColor} />
          </ThemedView>
          {!user && (
            <AgendaItemSaveButton
              eventId={id}
              isRSVP={hasRSVP}
              setRsvpEventIds={setRsvpEventIds}
            />
          )}
        </ThemedView>
        {/* Topic Badge */}
        <ThemedView
          style={[styles.topicBadge, { backgroundColor: topicColor }]}
        >
          <ThemedText style={styles.topicText}>{topicName}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <IconSymbol name="clock.fill" size={16} color={tintColor} />
          <ThemedText style={styles.time}>
            {formatTimeRange(startTime, endTime)}
          </ThemedText>
        </ThemedView>
        {title !== "Break" && (
          <ThemedView style={styles.infoRow}>
            <IconSymbol name="mappin.circle.fill" size={16} color={tintColor} />
            <ThemedText style={styles.location}>{location}</ThemedText>
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
  topicBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  topicText: {
    color: "white",
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
});
