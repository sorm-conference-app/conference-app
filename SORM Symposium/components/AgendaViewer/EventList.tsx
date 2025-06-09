import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import type { Event } from '@/types/Events.types';
import AgendaItem from '@/components/AgendaItem';
import { findConflicts, groupEventsByDate } from './utils';
import { getAllEvents } from '@/services/events';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Stack } from 'expo-router';
import { formatDate } from '@/lib/dateTime';

type EventListProps = {
  onSelectEvent: (event: Event) => void;
};

export function EventList({ onSelectEvent }: EventListProps) {
  const colorScheme = useColorScheme() ?? 'light';
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

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Event Viewer",
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
            title: "Event Viewer",
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
                          onPress={() => onSelectEvent(item)}
                        />
                        <View style={{ flex: 1 }}>
                          {item.conflictingItems.map((conflictItem) => (
                            <AgendaItem
                              key={conflictItem.id}
                              title={conflictItem.title}
                              startTime={conflictItem.start_time}
                              endTime={conflictItem.end_time}
                              location={conflictItem.location}
                              onPress={() => onSelectEvent(conflictItem)}
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
                      onPress={() => onSelectEvent(item)}
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
    padding: 16,
  },
  eventGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  eventWrapper: {
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