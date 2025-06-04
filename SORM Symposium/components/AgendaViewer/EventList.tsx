import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Event } from './types';
import AgendaItem from '@/components/AgendaItem';
import { AlertModal } from './AlertModal';

type EventListProps = {
  events: Event[];
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (event: Event) => void;
};

export function EventList({ events, onEditEvent, onDeleteEvent }: EventListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showOptions, setShowOptions] = useState(false);

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
      {events.map((event) => (
        <AgendaItem
          key={event.id}
          title={event.title}
          startTime={event.startTime}
          endTime={event.endTime}
          location={event.location ?? ''}
          onPress={() => handleEventPress(event)}
        />
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
}); 