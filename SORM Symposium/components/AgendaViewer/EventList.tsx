import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Event } from './types';
import AgendaItem from '@/components/AgendaItem';
import { AlertModal } from './AlertModal';
import { detectTimeConflicts } from './utils';

type EventListProps = {
  events: Event[];
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (event: Event) => void;
};

type EventGroup = {
  events: Event[];
  hasConflict: boolean;
};

export function EventList({ events, onEditEvent, onDeleteEvent }: EventListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showOptions, setShowOptions] = useState(false);

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

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setShowOptions(true);
  };

  const handleEdit = () => {
    if (selectedEvent) {
      onEditEvent(selectedEvent);
      setShowOptions(false);
    }
  };

  const handleDelete = () => {
    if (selectedEvent) {
      onDeleteEvent(selectedEvent);
      setShowOptions(false);
    }
  };

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
                onPress={() => handleEventPress(event)}
              />
            </View>
          ))}
        </View>
      ))}

      <AlertModal
        visible={showOptions}
        title={selectedEvent?.title ?? ''}
        message="What would you like to do with this event?"
        buttons={[
          {
            text: 'Edit',
            onPress: handleEdit,
          },
          {
            text: 'Delete',
            onPress: handleDelete,
            style: 'destructive',
          },
          {
            text: 'Cancel',
            onPress: () => setShowOptions(false),
            style: 'cancel',
          },
        ]}
        onClose={() => setShowOptions(false)}
      />
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