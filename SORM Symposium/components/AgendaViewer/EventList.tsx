import AgendaItem from "@/components/AgendaViewer/AgendaItem";
import { SpecialEventGroup } from "@/components/AgendaViewer/SpecialEventGroup";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { formatDate } from "@/lib/dateTime";
import type { Event } from "@/types/Events.types";
import React, {
  Dispatch,
  SetStateAction,
  useMemo,
} from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
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
import useEvents from "@/hooks/useEvents";
import useRSVPEvents from "@/hooks/useRSVPEvents";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useCurrentAttendee } from "@/hooks/useCurrentAttendee";
import { IconSymbol } from "../ui/IconSymbol";

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
  setShowDeleted = () => {},
  reloadTrigger = 0,
}: EventListProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isAdmin = useIsAdmin();

  const dateRefs = useMemo(() => ({} as { [key: string]: View | null }), []);
  const dateHeights = useMemo(() => ({} as { [key: string]: number }), []);

  // Get current attendee information
  const { attendee, loading: attendeeLoading, error: attendeeError } = useCurrentAttendee();

  // Use the new caching hooks
  const {
    data: allEvents = [],
    isLoading: eventsLoading,
    error: eventsError,
  } = useEvents({
    showDeleted: showDeleted === "all" ? true : showDeleted === "deleted" ? true : false,
  });

  const {
    data: rsvpEvents = [],
    isLoading: rsvpLoading,
    error: rsvpError,
    refetch: refetchRSVP,
  } = useRSVPEvents(attendee?.id || 0);

  // Create a set of RSVPed event IDs for quick lookup
  const rsvpEventIds = new Set<number>(rsvpEvents.map((event: Event) => event.id));

  // Filter and combine events based on showDeleted prop
  const displayedEvents = allEvents.filter((event: Event) => {
    if (showDeleted === "all") return true;
    if (showDeleted === "active") return !event.is_deleted;
    if (showDeleted === "deleted") return event.is_deleted;
    if (showDeleted === "saved") return !event.is_deleted && rsvpEventIds.has(event.id);
    return !event.is_deleted; // default to active
  });

  // Combine loading states
  const loading = eventsLoading || rsvpLoading || attendeeLoading;
  
  // Combine error states
  const error = eventsError || rsvpError || attendeeError;

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
        {showHeader ? (
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
              {Platform.OS === 'web' ? 'Click' : 'Tap'} on an event to view more details
            </ThemedText>

            {!isAdmin ? (
            <ThemedText style={styles.subheader} type="subtitle">
              {Platform.OS === 'web' ? 'Click' : 'Tap'} the <IconSymbol 
              name="star" size={20} color={Colors[colorScheme].text}
              /> icon to save an event
            </ThemedText>
            ) : null}

            {isAdmin ? (
            <ThemedText style={styles.subheader} type="subtitle">
              Log in as an attendee to save events and view your saved events
            </ThemedText>
            ) : null}

            {!isAdmin ? (
            <Pressable
              style={[
                {
                  padding: 8,
                  borderRadius: 5,
                  borderWidth: 1,
                  marginLeft: 16,
                  marginTop: 16,
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
            ) : null}
          </ThemedView>
        ) : null}
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
                  dateRefs[date] = ref;
                }}
                onLayout={(e) => {
                  dateHeights[date] = e.nativeEvent.layout.height;
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
                          dateRefs[date]?.measure((y) => {
                            const previousHeights = sortedDates
                              .filter((d) => d < date)
                              .reduce(
                                (sum, d) => sum + (dateHeights[d] || 0),
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
                          setRsvpEventIds={handleRSVPUpdate}
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
                        dateRefs[date]?.measure((y) => {
                          const previousHeights = sortedDates
                            .filter((d) => d < date)
                            .reduce(
                              (sum, d) => sum + (dateHeights[d] || 0),
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
                              setRsvpEventIds={handleRSVPUpdate}
                              topic={item.topic}
                              height={item.topic === "Break" ? 100 : calculateHeight(item.start_time, item.end_time)}
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
                              setRsvpEventIds={handleRSVPUpdate}
                              topic={item.topic}
                              height={item.topic === "Break" ? 100 : calculateHeight(item.start_time, item.end_time)}
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
                            height={item.topic === "Break" ? 100 : calculateHeight(item.start_time, item.end_time)}
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
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
});
