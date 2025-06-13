import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { formatTimeRange } from "@/lib/dateTime";
import { calculateHeight } from "./utils";
import { Pressable, StyleSheet } from "react-native";

type AgendaItemProps = {
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  isDeleted: boolean;
  onPress: () => void;
};

export default function AgendaItem({
  title,
  startTime,
  endTime,
  location,
  isDeleted,
  onPress,
}: AgendaItemProps) {
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.agendaItem,
        { backgroundColor: Colors[colorScheme].secondaryBackgroundColor },
        { borderColor: Colors[colorScheme].tint },
        { minHeight: title === "Break" ? 65 : calculateHeight(startTime, endTime) },
        pressed && styles.agendaItemPressed,
      ]}
      onPress={onPress}
    >
      <ThemedView style={[styles.agendaContent, 
        { backgroundColor: colorScheme === "light" 
          ? Colors[colorScheme].background : Colors[colorScheme].background }]}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText style={styles.title} type="defaultSemiBold">
            {title}
          </ThemedText>
          {isDeleted && <ThemedText style={styles.deletedTitle} type="defaultSemiBold"> - Deleted</ThemedText>}
          <IconSymbol name="chevron.right" size={20} color={tintColor} />
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <IconSymbol name="clock.fill" size={16} color={tintColor} />
          <ThemedText style={styles.time}>
            {formatTimeRange(startTime, endTime)}
          </ThemedText>
        </ThemedView>
        {title !== "Break" && <ThemedView style={styles.infoRow}>
          <IconSymbol name="mappin.circle.fill" size={16} color={tintColor} />
          <ThemedText style={styles.location}>{location}</ThemedText>
        </ThemedView>}
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
  agendaContent: {
    flex: 1,
    display: "flex",
    padding: 8,
  },
});
