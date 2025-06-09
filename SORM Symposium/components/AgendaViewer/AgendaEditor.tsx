import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { EventForm } from './EventForm';
import { EventList } from './EventList';
import { AlertModal } from './AlertModal';
import type { Event } from '@/types/Events.types';

const BREAKPOINT = 700; // Threshold for wide screen

interface AgendaEditorProps {
  onShowForm: () => void;
}

export function AgendaEditor({ onShowForm }: AgendaEditorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [showAlert, setShowAlert] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(true);

  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>;
  }>({
    title: '',
    message: '',
    buttons: [],
  });

  useEffect(() => {
    const updateLayout = () => {
      const width = Dimensions.get('window').width;
      setIsWideScreen(width >= BREAKPOINT);
    };

    updateLayout();
    const subscription = Dimensions.addEventListener('change', updateLayout);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleEventSelect = (event: Event) => {
    setAlertConfig({
      title: event.title,
      message: "What would you like to do with this event?",
      buttons: [
        {
          text: 'Edit',
          onPress: () => {
            setShowAlert(false);
            handleEditEvent(event);
          },
        },
        {
          text: 'Delete',
          onPress: () => {
            setShowAlert(false);
            setTimeout(() => {
              handleDeleteEvent(event);
            }, 100);
          },
          style: 'destructive',
        },
        {
          text: 'Cancel',
          onPress: () => setShowAlert(false),
          style: 'cancel',
        },
      ],
    });
    setShowAlert(true);
  };

  const handleAddEvent = (event: Event) => {
    // const newEvents = [...events];
    // if (editingEvent) {
    //   const index = newEvents.findIndex(e => e.id === event.id);
    //   if (index !== -1) {
    //     newEvents[index] = event;
    //   }
    // } else {
    //   newEvents.push(event);
    // }

    // // Sort events by start time
    // newEvents.sort((a, b) => a.start_time.localeCompare(b.start_time));

    // const conflicts = detectTimeConflicts(newEvents);
    // const relevantConflicts = conflicts.filter(conflict => 
    //   conflict.event1.id === event.id || conflict.event2.id === event.id
    // );

    // if (relevantConflicts.length > 0) {
    //   setAlertConfig({
    //     title: 'Time Conflict Detected',
    //     message: formatConflictMessage(relevantConflicts[0]),
    //     buttons: [
    //       {
    //         text: 'Cancel',
    //         onPress: () => {},
    //         style: 'cancel',
    //       },
    //       {
    //         text: editingEvent ? 'Update Anyway' : 'Add Anyway',
    //         onPress: () => {
    //           setEvents(newEvents);
    //           setShowForm(false);
    //           setEditingEvent(undefined);
    //         },
    //       },
    //     ],
    //   });
    //   setShowAlert(true);
    // } else {
    //   setEvents(newEvents);
    //   setShowForm(false);
    //   setEditingEvent(undefined);
    // }
  };

  const handleShowForm = () => {
    setEditingEvent(undefined);
    setShowForm(true);
    onShowForm();
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
    setTimeout(() => {
      onShowForm();
    }, 350);
  };

  const handleDeleteEvent = (event: Event) => {
    setAlertConfig({
      title: 'Delete Event',
      message: `Are you sure you want to delete "${event.title}"?`,
      buttons: [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            // setEvents(events.filter(e => e.id !== event.id));
          },
          style: 'destructive',
        },
      ],
    });
    setShowAlert(true);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <ThemedText type="title">Agenda Editor</ThemedText>
          {isWideScreen && (
            <ThemedText style={[styles.subtitleText, { color: Colors[colorScheme].text }
            ]} type="subtitle">Select an event to edit or delete it</ThemedText>
          )}
          <Pressable
            style={[
              styles.addButton,
              { backgroundColor: Colors[colorScheme].adminButton },
              { borderColor: Colors[colorScheme].tint }
            ]}
            onPress={handleShowForm}
          >
            <ThemedText style={[styles.addButtonText,
              { color: Colors[colorScheme].adminButtonText }
            ]}>Add Event</ThemedText>
          </Pressable>
        </View>
        {!isWideScreen && (
          <ThemedText style={[styles.subtitleText, { color: Colors[colorScheme].text }
          ]} type="subtitle">Select an event to edit or delete it</ThemedText>
        )}
      </View>

      {showForm && (
        <EventForm
          event={editingEvent}
          onSubmit={handleAddEvent}
          onCancel={() => {
            setShowForm(false);
            setEditingEvent(undefined);
          }}
        />
      )}
      <EventList onSelectEvent={handleEventSelect} />

      <AlertModal
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setShowAlert(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    gap: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  addButtonText: {
    fontWeight: 'bold',
  },
  subtitleText: {
    fontWeight: 'bold',
  },
});
