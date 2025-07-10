import AgendaItem from "@/components/AgendaViewer/AgendaItem";
import { SpecialEventGroup } from "@/components/AgendaViewer/SpecialEventGroup";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { formatDate } from "@/lib/dateTime";
import { getDeviceId } from "@/lib/user";
import {
  getAllEvents,
  getRSVPedEvents,
  subscribeToEvents,
} from "@/services/events";
import type { Event } from "@/types/Events.types";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import {
  calculateHeight,
  findConflicts,
  groupEventsByDate,
  isCol1Location,
  isCol2Location,
} from "./utils";
import { Pressable } from "react-native-gesture-handler";

type EventListProps = {
  onSelectEvent: (event: Event) => void;
  onEventPosition: (event: Event, y: number) => void;
  showHeader?: boolean;
  showDeleted?: "all" | "active" | "deleted" | "saved";
  setShowDeleted?: Dispatch<
    SetStateAction<"all" | "active" | "deleted" | "saved">
  >;
  reloadTrigger?: number;
};

export function EventList({
  onSelectEvent,
  onEventPosition,
  showHeader = true,
  showDeleted = "active",
  setShowDeleted = () => {}, // Default to a no-op function if not provided
  reloadTrigger = 0,
}: EventListProps) {
  const colorScheme = useColorScheme() ?? "light";

  const [events, setEvents] = useState<Event[]>([]);
  const [rsvpEventIds, setRsvpEventIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dateRefs = useRef<{ [key: string]: View | null }>({});
  const dateHeights = useRef<{ [key: string]: number }>({});
  const displayedEvents = events.filter(
    (event) =>
      showDeleted === "all" ||
      (showDeleted === "active" && !event.is_deleted) ||
      (showDeleted === "deleted" && event.is_deleted) ||
      (showDeleted === "saved" &&
        !event.is_deleted &&
        rsvpEventIds.has(event.id)),
  );

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const deviceId = await getDeviceId();
        const rsvpedEventIds = await getRSVPedEvents(deviceId);
        const allEvents = await getAllEvents();
        setEvents(allEvents);
        setRsvpEventIds(new Set(rsvpedEventIds));
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [reloadTrigger]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Subscribe to real-time updates
    const subscribe = subscribeToEvents((updatedEvents) => {
      setEvents(updatedEvents);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscribe();
    };
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>Loading events...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  const eventsByDate = groupEventsByDate(displayedEvents);
  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {showHeader && (
          <ThemedView
            style={{
              flexWrap: "wrap",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
            }}
          >
            <ThemedText style={styles.header} type="title">
              Conference Schedule
            </ThemedText>
            <ThemedText style={styles.subheader} type="subtitle">
              Select an event to view more details
            </ThemedText>

            <Pressable
              style={[
                {
                  padding: 8,
                  borderRadius: 5,
                  borderWidth: 1,
                  marginLeft: 16,
                },
                { backgroundColor: Colors[colorScheme].adminButton },
                { borderColor: Colors[colorScheme].text },
              ]}
              onPress={() =>
                setShowDeleted((prev) =>
                  prev === "saved" ? "active" : "saved",
                )
              }
            >
              <ThemedText
                style={[
                  { color: Colors[colorScheme].adminButtonText },
                  { fontWeight: "bold" },
                ]}
              >
                Viewing: {showDeleted === "saved" ? "Saved" : "All"} Events
              </ThemedText>
            </Pressable>
          </ThemedView>
        )}
        <View style={styles.content}>
          {sortedDates.length === 0 ? (
            <ThemedText style={styles.noEventsText}>No events found</ThemedText>
          ) : (
            sortedDates.map((date) => (
              <View
                key={date}
                style={[
                  styles.dateSection,
                  {
                    backgroundColor:
                      Colors[colorScheme].secondaryBackgroundColor,
                  },
                  { borderColor: Colors[colorScheme].text },
                ]}
                ref={(ref) => {
                  dateRefs.current[date] = ref;
                }}
                onLayout={(e) => {
                  dateHeights.current[date] = e.nativeEvent.layout.height;
                }}
              >
                <ThemedText
                  style={[
                    styles.dateHeader,
                    {
                      backgroundColor:
                        Colors[colorScheme].secondaryBackgroundColor,
                    },
                  ]}
                  type="subtitle"
                >
                  {formatDate(date)}
                </ThemedText>
                {findConflicts(eventsByDate[date]).map((item) => {
                  if (item.conflictingItems.length > 0) {
                    // Use SpecialEventGroup for conflicting events
                    return (
                      <View
                        key={item.id}
                        style={styles.conflictContent}
                        onLayout={(e) => {
                          dateRefs.current[date]?.measure((y) => {
                            const previousHeights = sortedDates
                              .filter((d) => d < date)
                              .reduce(
                                (sum, d) => sum + (dateHeights.current[d] || 0),
                                0,
                              );
                            onEventPosition(
                              item,
                              y + e.nativeEvent.layout.y + previousHeights,
                            );
                          });
                        }}
                      >
                        <SpecialEventGroup
                          mainEvent={item}
                          conflictingItems={item.conflictingItems}
                          rsvpEventIds={rsvpEventIds}
                          setRsvpEventIds={setRsvpEventIds}
                          onSelectEvent={onSelectEvent}
                        />
                      </View>
                    );
                  }

                  return (
                    <View
                      key={item.id}
                      style={styles.conflictContent}
                      onLayout={(e) => {
                        // calculate the y position of the event
                        dateRefs.current[date]?.measure((y) => {
                          const previousHeights = sortedDates
                            .filter((d) => d < date)
                            .reduce(
                              (sum, d) => sum + (dateHeights.current[d] || 0),
                              0,
                            );

                          // call the onEventPosition callback with the y position of the event
                          onEventPosition(
                            item,
                            y + e.nativeEvent.layout.y + previousHeights,
                          );
                        });
                      }}
                    >
                      {isCol1Location(item.location) ? (
                        <>
                          <View
                            style={[
                              styles.eventWrapper,
                              { alignSelf: "flex-start" },
                            ]}
                          >
                            <AgendaItem
                              id={item.id}
                              title={item.title}
                              startTime={item.start_time}
                              endTime={item.end_time}
                              location={item.location}
                              isDeleted={item.is_deleted}
                              hasRSVP={rsvpEventIds.has(item.id)}
                              setRsvpEventIds={setRsvpEventIds}
                              topic={item.topic}
                              height={item.topic === "Break" ? 50 : calculateHeight(item.start_time, item.end_time)}
                              onPress={() => onSelectEvent(item)}
                            />
                          </View>
                          <View style={styles.eventWrapper}>
                            {/* Empty right column */}
                          </View>
                        </>
                      ) : isCol2Location(item.location) ? (
                        <>
                          <View
                            style={[
                              styles.eventWrapper,
                              { alignSelf: "flex-start" },
                            ]}
                          >
                            {/* Empty left column */}
                          </View>
                          <View style={styles.eventWrapper}>
                            <AgendaItem
                              id={item.id}
                              title={item.title}
                              startTime={item.start_time}
                              endTime={item.end_time}
                              location={item.location}
                              isDeleted={item.is_deleted}
                              hasRSVP={rsvpEventIds.has(item.id)}
                              setRsvpEventIds={setRsvpEventIds}
                              height={item.topic === "Break" ? 50 : calculateHeight(item.start_time, item.end_time)}
                              onPress={() => onSelectEvent(item)}
                            />
                          </View>
                        </>
                      ) : (
                        // Event with other location or null - use single column layout
                        <View style={[styles.eventWrapper]}>
                          <AgendaItem
                            id={item.id}
                            title={item.title}
                            startTime={item.start_time}
                            endTime={item.end_time}
                            location={item.location}
                            isDeleted={item.is_deleted}
                            hasRSVP={rsvpEventIds.has(item.id)}
                            setRsvpEventIds={setRsvpEventIds}
                            topic={item.topic}
                            height={item.topic === "Break" ? 50 : calculateHeight(item.start_time, item.end_time)}
                            onPress={() => onSelectEvent(item)}
                          />
                        </View>
                      )}
                    </View>
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
  eventGroup: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  eventWrapper: {
    flex: 1,
    minWidth: 0, // Allows flex items to shrink below their content size
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  content: {
    padding: 16,
  },
  noEventsText: {
    fontSize: 16,
    textAlign: "center",
  },
  dateSection: {
    marginBottom: 16,
    padding: 4,
    borderRadius: 16,
    borderWidth: 3,
    borderStyle: "solid",
  },
  dateHeader: {
    marginBottom: 8,
    paddingLeft: 8,
    zIndex: 1,
    alignSelf: "flex-start",
  },
  conflictContent: {
    flexDirection: "row",
    gap: 16,
  },
  subheader: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
    fontSize: 16,
    textAlign: "center",
  },
});
