import AgendaItem from "@/components/AgendaItem";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { formatDate } from "@/lib/dateTime";
import { getAllEvents } from "@/services/events";
import type { Event } from "@/types/Events.types";
import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

function convert24HrTimeToSeconds(time: string): number {
  // Handle 24-hour format (HH:mm:ss or HH:mm)
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 3600 + (minutes || 0) * 60;
}

function convert12HrTimeToSeconds(time: string): number {
  // Only try to handle 12-hour format if it includes AM/PM
  if (time.includes("AM") || time.includes("PM")) {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (modifier.toUpperCase() === "PM" && hours < 12) {
      hours += 12;
    } else if (modifier.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }

    return hours * 3600 + minutes * 60;
  }

  // If no AM/PM, treat as 24-hour format
  return convert24HrTimeToSeconds(time);
}

/**
 * Determine if two time intervals conflict.
 * @param startTimeA Start time for first event.
 * @param endTimeA End time for first event.
 * @param startTimeB Start time for second event.
 * @param endTimeB End time for second event.
 * @returns
 */
function areTimesConflicting(
  startTimeA: string,
  endTimeA: string,
  startTimeB: string,
  endTimeB: string
): boolean {
  const startA = convert24HrTimeToSeconds(startTimeA);
  const endA = convert24HrTimeToSeconds(endTimeA);
  const startB = convert24HrTimeToSeconds(startTimeB);
  const endB = convert24HrTimeToSeconds(endTimeB);

  return startA < endB && startB < endA;
}

function calculateTimeOffset(startTimeA: string, startTimeB: string): number {
  const timeA = convert12HrFormatToSeconds(startTimeA);
  const timeB = convert12HrFormatToSeconds(startTimeB);
  // Convert time difference to pixels (e.g., 30 minutes = 50 pixels)
  return Math.max(0, (timeB - timeA) * (50 / 1800)); // 1800 seconds = 30 minutes
}

type EventsByDate = {
  [date: string]: Event[];
};

function groupEventsByDate(events: Event[]): EventsByDate {
  return events.reduce((acc: EventsByDate, event) => {
    if (!acc[event.event_date]) {
      acc[event.event_date] = [];
    }
    acc[event.event_date].push(event);
    return acc;
  }, {});
}

export default function AgendaScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const allEvents = await getAllEvents();
        setEvents(allEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const navigateToEvent = (id: number) => {
    router.push({
      pathname: "/event/[id]",
      params: { id },
    });
  };

  const findConflicts = (events: Event[]) => {
    const conflictIds = new Set<number>();
    const items = [];

    for (const item of events) {
      if (conflictIds.has(item.id)) {
        continue;
      }

      const conflicts = events.filter(
        (conflictItem) =>
          conflictItem.id !== item.id &&
          areTimesConflicting(
            item.start_time,
            item.end_time,
            conflictItem.start_time,
            conflictItem.end_time
          )
      );

      items.push({
        ...item,
        conflictingItems: conflicts,
      });
      for (const conflictItem of conflicts) {
        conflictIds.add(conflictItem.id);
      }
    }

    return items;
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Agenda",
            headerShown: true,
          }}
        />
        <ThemedText style={styles.loadingText}>Loading events...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Agenda",
            headerShown: true,
          }}
        />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  const eventsByDate = groupEventsByDate(events);
  const sortedDates = Object.keys(eventsByDate).sort();

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
          Conference Schedule
        </ThemedText>
        <View style={styles.content}>
          {sortedDates.length === 0 ? (
            <ThemedText style={styles.noEventsText}>No events found</ThemedText>
          ) : (
            sortedDates.map((date) => (
              <View key={date} style={styles.dateSection}>
                <ThemedText style={styles.dateHeader} type="subtitle">
                  {formatDate(date)}
                </ThemedText>
                {findConflicts(eventsByDate[date]).map((item) => {
                  if (item.conflictingItems.length > 0) {
                    return (
                      <View key={item.id} style={styles.conflictContent}>
                        <AgendaItem
                          title={item.title}
                          startTime={item.start_time}
                          endTime={item.end_time}
                          location={item.location}
                          onPress={() => navigateToEvent(item.id)}
                        />
                        <View style={{ flex: 1 }}>
                          {item.conflictingItems.map((conflictItem) => (
                            <AgendaItem
                              key={conflictItem.id}
                              title={conflictItem.title}
                              startTime={conflictItem.start_time}
                              endTime={conflictItem.end_time}
                              location={conflictItem.location}
                              onPress={() => navigateToEvent(conflictItem.id)}
                            />
                          ))}
                        </View>
                      </View>
                    );
                  }

                  return (
                    <AgendaItem
                      key={item.id}
                      title={item.title}
                      startTime={item.start_time}
                      endTime={item.end_time}
                      location={item.location}
                      onPress={() => navigateToEvent(item.id)}
                    />
                  );
                })}
              </View>
            ))
          )}
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
    alignItems: "flex-start",
  },
  header: {
    marginTop: 16,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 20,
  },
  dateHeader: {
    marginBottom: 12,
  },
  dateSection: {
    marginBottom: 24,
  },
  loadingText: {
    padding: 16,
    textAlign: "center",
  },
  errorText: {
    padding: 16,
    textAlign: "center",
    color: "red",
  },
  noEventsText: {
    padding: 16,
    textAlign: "center",
  },
});
