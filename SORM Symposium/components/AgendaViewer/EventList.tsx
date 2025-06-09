import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Event } from './types';
import AgendaItem from '@/components/AgendaItem';
import { detectTimeConflicts } from './utils';

type EventListProps = {
  events: Event[];
  onSelectEvent: (event: Event) => void;
};

type EventGroup = {
  events: Event[];
  hasConflict: boolean;
};

export function EventList({ events, onSelectEvent }: EventListProps) {
  const colorScheme = useColorScheme() ?? 'light';

  // Group events by time conflicts
  const eventGroups: EventGroup[] = React.useMemo(() => {
    const conflicts = detectTimeConflicts(events);
    const conflictMap = new Map<string, Set<string>>();
    
    // Build a map of which events conflict with each other
    conflicts.forEach(conflict => {
      const { event1, event2 } = conflict;
      if (!conflictMap.has(event1.id)) conflictMap.set(event1.id, new Set());
      if (!conflictMap.has(event2.id)) conflictMap.set(event2.id, new Set());
      conflictMap.get(event1.id)!.add(event2.id);
      conflictMap.get(event2.id)!.add(event1.id);
    });

    // Group events that conflict with each other
    const groups: EventGroup[] = [];
    const processed = new Set<string>();

    events.forEach(event => {
      if (processed.has(event.id)) return;

      const group: Event[] = [event];
      processed.add(event.id);

      // Find all events that conflict with this event
      const conflictingIds = conflictMap.get(event.id) || new Set();
      conflictingIds.forEach(id => {
        const conflictingEvent = events.find(e => e.id === id);
        if (conflictingEvent && !processed.has(id)) {
          group.push(conflictingEvent);
          processed.add(id);
        }
      });

      groups.push({
        events: group,
        hasConflict: group.length > 1
      });
    });

    return groups;
  }, [events]);

  return (
    <ScrollView style={[styles.container,
      { backgroundColor: Colors[colorScheme].secondaryBackgroundColor }
    ]}>
      {eventGroups.map((group, groupIndex) => (
        <View key={groupIndex} style={styles.eventGroup}>
          {group.events.map((event) => (
            <View 
              key={event.id} 
              style={[
                styles.eventWrapper,
                { flex: group.hasConflict ? 1 : undefined, 
                  width: group.hasConflict ? undefined : '100%' }
              ]}
            >
              <AgendaItem
                title={event.title}
                startTime={event.startTime}
                endTime={event.endTime}
                location={event.location ?? ''}
                onPress={() => onSelectEvent(event)}
              />
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
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
}); 