import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import type { Event } from '@/types/Events.types';
import AgendaItem from '@/components/AgendaViewer/AgendaItem';
import { findConflicts, groupEventsByDate } from './utils';
import { getAllEvents, subscribeToEvents } from '@/services/events';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { formatDate } from '@/lib/dateTime';

type EventListProps = {
  onSelectEvent: (event: Event) => void;
  onEventPosition: (event: Event, y: number) => void;
  showHeader?: boolean;
  showDeleted?: boolean;
  reloadTrigger?: number;
};

export function EventList({ onSelectEvent, onEventPosition, showHeader = true, showDeleted = false, reloadTrigger = 0 }: EventListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dateRefs = useRef<{ [key: string]: View | null }>({});
  const dateHeights = useRef<{ [key: string]: number }>({});
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const allEvents = await getAllEvents();
        setEvents(allEvents.filter(event => showDeleted || !event.is_deleted));
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
      setEvents(updatedEvents.filter(event => showDeleted || !event.is_deleted));
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

  const eventsByDate = groupEventsByDate(events);
  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {showHeader && (
          <ThemedText style={styles.header} type="title">
            Conference Schedule
          </ThemedText>
        )}
        <View style={styles.content}>
          {sortedDates.length === 0 ? (
            <ThemedText style={styles.noEventsText}>No events found</ThemedText>
          ) : (
            sortedDates.map((date) => (
              <View 
                key={date} 
                style={styles.dateSection}
                ref={ref => { dateRefs.current[date] = ref; }}
                onLayout={(e) => {
                  dateHeights.current[date] = e.nativeEvent.layout.height;
                }}
              >
                <ThemedText style={styles.dateHeader} type="subtitle">
                  {formatDate(date)}
                </ThemedText>
                {findConflicts(eventsByDate[date]).map((item) => {
                  if (item.conflictingItems.length > 0) {
                    return (
                      <View key={item.id} style={styles.conflictContent}
                        onLayout={(e) => {
                          // calculate the y position of the events in this row
                          dateRefs.current[date]?.measure((y) => {
                            const previousHeights = sortedDates
                              .filter(d => d < date)
                              .reduce((sum, d) => sum + (dateHeights.current[d] || 0), 0);
                            
                            // call the onEventPosition callback with the y position of the events in this row
                            onEventPosition(item, y + e.nativeEvent.layout.y + previousHeights);
                            for (const conflictItem of item.conflictingItems) {
                              onEventPosition(conflictItem, y + e.nativeEvent.layout.y + previousHeights);
                            }
                          });
                        }}
                      >
                        <View style={styles.eventWrapper}>
                          <AgendaItem
                            title={item.title}
                            startTime={item.start_time}
                            endTime={item.end_time}
                            location={item.location}
                            isDeleted={item.is_deleted}
                            onPress={() => onSelectEvent(item)}
                          />
                        </View>
                        <View style={styles.eventWrapper}>
                          {item.conflictingItems.map((conflictItem) => (
                            <View 
                              key={conflictItem.id}
                            >
                              <AgendaItem
                                title={conflictItem.title}
                                startTime={conflictItem.start_time}
                                endTime={conflictItem.end_time}
                                location={conflictItem.location}
                                isDeleted={conflictItem.is_deleted}
                                onPress={() => onSelectEvent(conflictItem)}
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
                      onLayout={(e) => {
                        // calculate the y position of the event
                        dateRefs.current[date]?.measure((y) => {
                          const previousHeights = sortedDates
                            .filter(d => d < date)
                            .reduce((sum, d) => sum + (dateHeights.current[d] || 0), 0);
                          
                          // call the onEventPosition callback with the y position of the event
                          onEventPosition(item, y + e.nativeEvent.layout.y + previousHeights);
                        });
                      }}
                    >
                      <AgendaItem
                        title={item.title}
                        startTime={item.start_time}
                        endTime={item.end_time}
                        location={item.location}
                        isDeleted={item.is_deleted}
                        onPress={() => onSelectEvent(item)}
                      />
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
    padding: 16,
  },
  eventGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  eventWrapper: {
    flex: 1,
    minWidth: 0, // Allows flex items to shrink below their content size
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
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
    textAlign: 'center',
  },
  dateSection: {
    marginBottom: 16,
  },
  dateHeader: {
    marginBottom: 8,
  },
  conflictContent: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
}); 