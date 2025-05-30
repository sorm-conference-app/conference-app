import { StyleSheet } from "react-native";
import { View, ScrollView, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Stack, router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import AgendaItem from "@/components/AgendaItem";

function convert12HrFormatToSeconds(time: string): number {
  const [timePart, modifier] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (modifier.toUpperCase() === "PM" && hours < 12) {
    hours += 12;
  } else if (modifier.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 3600 + minutes * 60;
}

function areTimesConflicting(
  startTimeA: string,
  endTimeA: string,
  startTimeB: string,
  endTimeB: string,
): boolean {
  const startA = convert12HrFormatToSeconds(startTimeA);
  const endA = convert12HrFormatToSeconds(endTimeA);
  const startB = convert12HrFormatToSeconds(startTimeB);
  const endB = convert12HrFormatToSeconds(endTimeB);

  return startA < endB && startB < endA;
}

function groupBy<T, K extends PropertyKey>(
  arr: T[],
  func: (i: T) => K,
): Record<K, T[]> {
  return arr.reduce(
    (acc, item) => {
      const key = func(item);
      acc[key] = acc[key] || [];
      acc[key].push(item);

      return acc;
    },
    {} as Record<K, T[]>,
  );
}

// Placeholder data for agenda items
const placeholderAgendaItems = [
  {
    id: "1",
    title: "Welcome and Registration",
    startTime: "8:00 AM",
    endTime: "9:00 AM",
    location: "Main Hall",
  },
  {
    id: "2",
    title: "Opening Keynote",
    startTime: "8:30 AM",
    endTime: "10:30 AM",
    location: "Auditorium A",
  },
  {
    id: "3",
    title: "Break",
    startTime: "10:30 AM",
    endTime: "11:00 AM",
    location: "Networking Area",
  },
];

export default function AgendaScreen() {
  const tintColor = Colors[useColorScheme() ?? "light"].tint;

  const navigateToEvent = (id: string) => {
    router.push({
      pathname: "/event/[id]",
      params: { id },
    });
  };

  // Check for conflicts in the agenda items
  // An O(n^2) approach to check conflicts, which is obviously not efficient for most cases.
  // However, in our case, the number of agenda items will likely small, so this is might be acceptable.
  // A more efficient algorithm would be to use the Line Sweep Algorithm.
  const checkConflictItems = placeholderAgendaItems.map((item) => {
    const conflictingItems = placeholderAgendaItems.filter((otherItem) => {
      return (
        otherItem.id !== item.id &&
        areTimesConflicting(
          item.startTime,
          item.endTime,
          otherItem.startTime,
          otherItem.endTime,
        )
      );
    });

    return {
      ...item,
      hasConflict: conflictingItems.length > 0,
      conflictingItems,
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Agenda",
          headerShown: true,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <ThemedText style={styles.header} type="title">
          Today's Schedule
        </ThemedText>
        <View style={styles.content}>
          {checkConflictItems.map((item) => {
            const onPress = () => navigateToEvent(item.id);

            if (item.hasConflict) {
              return (
                <View key={item.id} style={styles.conflictContent}>
                  <AgendaItem onPress={onPress} {...item} />
                  <View style={{ flex: 1 }}>
                    {item.conflictingItems.map((conflictItem) => (
                      <AgendaItem
                        key={conflictItem.id}
                        onPress={onPress}
                        {...conflictItem}
                      />
                    ))}
                  </View>
                </View>
              );
            }

            return <AgendaItem key={item.id} onPress={onPress} {...item} />;
          })}
        </View>
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
  content: {
    padding: 16,
  },
  conflictContent: {
    gap: 8,
    flexDirection: "row",
  },
  header: {
    marginTop: 16,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 20,
  },
});
