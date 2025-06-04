import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { formatTimeRange } from "@/lib/dateTime";
import { Pressable, StyleSheet } from "react-native";

type AgendaItemProps = {
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  onPress: () => void;
};

export default function AgendaItem({
  title,
  startTime,
  endTime,
  location,
  onPress,
}: AgendaItemProps) {
  const tintColor = Colors[useColorScheme() ?? "light"].tint;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.agendaItem,
        pressed && styles.agendaItemPressed,
      ]}
      onPress={onPress}
    >
      <ThemedView style={styles.agendaContent}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText style={styles.title} type="defaultSemiBold">
            {title}
          </ThemedText>
          <IconSymbol name="chevron.right" size={20} color={tintColor} />
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <IconSymbol name="clock.fill" size={16} color={tintColor} />
          <ThemedText style={styles.time}>
            {formatTimeRange(startTime, endTime)}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <IconSymbol name="mappin.circle.fill" size={16} color={tintColor} />
          <ThemedText style={styles.location}>{location}</ThemedText>
        </ThemedView>
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
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    marginBottom: 3,
  },
  time: {
    flex: 1,
  },
  agendaItem: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: "white",
    flexDirection: "row",
    alignItems: "center",
    userSelect: "none",
  },
  agendaItemPressed: {
    opacity: 0.7,
  },
  agendaContent: {
    flex: 1,
  },
});
