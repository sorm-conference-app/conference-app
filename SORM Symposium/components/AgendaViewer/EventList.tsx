import AgendaItem from "@/components/AgendaViewer/AgendaItem";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { formatDate } from "@/lib/dateTime";
import { getDeviceId } from "@/lib/user";
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
  calculateEventOffset,
  findConflicts,
  groupEventsByDate,
  sortEventsByLocation,
} from "./utils";
import { Pressable } from "react-native-gesture-handler";
import useEvents from "@/hooks/useEvents";
import useRSVPEvents from "@/hooks/useRSVPEvents";

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
  const COL_1_LOCATION = "Room 1";
  const COL_2_LOCATION = "Room 2";

  const [deviceId, setDeviceId] = useState<string>("");
  const dateRefs = useRef<{ [key: string]: View | null }>({});
  const dateHeights = useRef<{ [key: string]: number }>({});

  // Get device ID on mount
  useEffect(() => {
    getDeviceId().then(setDeviceId);
  }, []);

  // Use the new caching hooks
  const {
    data: allEvents = [],
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useEvents({
    showDeleted: showDeleted === "all" ? true : showDeleted === "deleted" ? true : false,
  });

  const {
    data: rsvpEvents = [],
    isLoading: rsvpLoading,
    error: rsvpError,
    refetch: refetchRSVP,
  } = useRSVPEvents(deviceId);

  // Create a set of RSVPed event IDs for quick lookup
  const rsvpEventIds = new Set(rsvpEvents.map(event => event.id));

  // Filter and combine events based on showDeleted prop
  const displayedEvents = allEvents.filter((event) => {
    if (showDeleted === "all") return true;
    if (showDeleted === "active") return !event.is_deleted;
    if (showDeleted === "deleted") return event.is_deleted;
    if (showDeleted === "saved") return !event.is_deleted && rsvpEventIds.has(event.id);
    return !event.is_deleted; // default to active
  });

  // Combine loading states
  const loading = eventsLoading || rsvpLoading || !deviceId;
  
  // Combine error states
  const error = eventsError || rsvpError;

  // Function to handle RSVP updates - triggers refetch to get latest data
  const handleRSVPUpdate = () => {
    refetchRSVP();
  };

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
        <ThemedText style={styles.errorText}>
          {error instanceof Error ? error.message : "Failed to load events"}
        </ThemedText>
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
                    // Sort events based on location priority
                    const sortedEvents = sortEventsByLocation(
                      [item, ...item.conflictingItems],
                      COL_1_LOCATION,
                      COL_2_LOCATION,
                    );
                    const col1Event = sortedEvents[0];
                    const col2Events = sortedEvents.slice(1);

                    return (
                      <View
                        key={item.id}
                        style={styles.conflictContent}
                        onLayout={(e) => {
                          // calculate the y position of the events in this row
                          dateRefs.current[date]?.measure((y) => {
                            const previousHeights = sortedDates
                              .filter((d) => d < date)
                              .reduce(
                                (sum, d) => sum + (dateHeights.current[d] || 0),
                                0,
                              );

                            // call the onEventPosition callback with the y position of the events in this row
                            onEventPosition(
                              item,
                              y + e.nativeEvent.layout.y + previousHeights,
                            );
                            for (const conflictItem of item.conflictingItems) {
                              onEventPosition(
                                conflictItem,
                                y + e.nativeEvent.layout.y + previousHeights,
                              );
                            }
                          });
                        }}
                      >
                        <View
                          style={[
                            styles.eventWrapper,
                            { alignSelf: "flex-start" },
                            {
                              marginTop: calculateEventOffset(
                                col2Events[0].start_time,
                                col1Event.start_time,
                              ),
                            },
                          ]}
                        >
                          <AgendaItem
                            id={col1Event.id}
                            title={col1Event.title}
                            startTime={col1Event.start_time}
                            endTime={col1Event.end_time}
                            location={col1Event.location}
                            isDeleted={col1Event.is_deleted}
                            hasRSVP={rsvpEventIds.has(col1Event.id)}
                            setRsvpEventIds={handleRSVPUpdate}
                            topic={col1Event.topic}
                            onPress={() => onSelectEvent(col1Event)}
                          />
                        </View>
                        <View style={styles.eventWrapper}>
                          {col2Events.map((col2Event) => (
                            <View
                              key={col2Event.id}
                              style={{
                                marginTop: calculateEventOffset(
                                  col1Event.start_time,
                                  col2Event.start_time,
                                ),
                              }}
                            >
                              <AgendaItem
                                id={col2Event.id}
                                title={col2Event.title}
                                startTime={col2Event.start_time}
                                endTime={col2Event.end_time}
                                location={col2Event.location}
                                isDeleted={col2Event.is_deleted}
                                hasRSVP={rsvpEventIds.has(col2Event.id)}
                                setRsvpEventIds={handleRSVPUpdate}
                                topic={col2Event.topic}
                                onPress={() => onSelectEvent(col2Event)}
                              />
                            </View>
                          ))}
                        </View>
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
                      {item.location === COL_1_LOCATION ? (
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
                              setRsvpEventIds={handleRSVPUpdate}
                              topic={item.topic}
                              onPress={() => onSelectEvent(item)}
                            />
                          </View>
                          <View style={styles.eventWrapper}>
                            {/* Empty right column */}
                          </View>
                        </>
                      ) : item.location === COL_2_LOCATION ? (
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
                              setRsvpEventIds={handleRSVPUpdate}
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
                            setRsvpEventIds={handleRSVPUpdate}
                            topic={item.topic}
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
});
