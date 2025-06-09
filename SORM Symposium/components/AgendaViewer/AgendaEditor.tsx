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
import { createEvent, updateEvent, deleteEvent, getAllEvents } from '@/services/events';

const BREAKPOINT = 700; // Threshold for wide screen

interface AgendaEditorProps {
  onShowForm: () => void;
  onCloseForm: (y: number) => void;
}

export function AgendaEditor({ onShowForm, onCloseForm }: AgendaEditorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [showAlert, setShowAlert] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(true);
  const [eventPositions] = useState(new Map<number, number>());
  const [headerHeight, setHeaderHeight] = useState(0);
  const [reloadTrigger, setReloadTrigger] = useState(0);

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

  const handleAddEvent = async (event: Event) => {
    try {
      if (editingEvent) {
        // Update existing event - only send the fields that can be updated
        const updateData = {
          title: event.title,
          description: event.description,
          location: event.location,
          start_time: event.start_time,
          end_time: event.end_time,
          speaker: event.speaker,
          slides_url: event.slides_url,
          speaker_name: event.speaker_name,
          speaker_title: event.speaker_title,
          speaker_bio: event.speaker_bio,
          event_date: event.event_date,
        };
        await updateEvent(editingEvent.id, updateData);
      } else {
        // Create new event - omit id and created_at
        const { id, created_at, ...createData } = event;
        await createEvent(createData);
      }
      
      // Trigger a reload of the EventList
      setReloadTrigger(prev => prev + 1);
      setShowForm(false);
      setEditingEvent(undefined);
      setTimeout(() => {
        const y = eventPositions.get(event.id) || 0;
        onCloseForm(y + headerHeight);
      }, 100);
    } catch (error) {
      console.error('Error saving event:', error);
      setAlertConfig({
        title: 'Error',
        message: 'Failed to save event. Please try again.',
        buttons: [
          {
            text: 'OK',
            onPress: () => {
              onCloseForm(0);
            },
            style: 'cancel',
          },
        ],
      });
      setShowAlert(true);
    }
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

  const handleDeleteEvent = async (event: Event) => {
    setAlertConfig({
      title: 'Delete Event',
      message: `Are you sure you want to delete "${event.title}"?`,
      buttons: [
        {
          text: 'Cancel',
          onPress: () => setShowAlert(false),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteEvent(event.id);
              // Trigger a reload of the EventList
              setReloadTrigger(prev => prev + 1);
              setShowAlert(false);
            } catch (error) {
              console.error('Error deleting event:', error);
              setAlertConfig({
                title: 'Error',
                message: 'Failed to delete event. Please try again.',
                buttons: [
                  {
                    text: 'OK',
                    onPress: () => setShowAlert(false),
                  },
                ],
              });
            }
          },
          style: 'destructive',
        },
      ],
    });
    setShowAlert(true);
  };

  const handleEventPosition = (event: Event, y: number) => {
    eventPositions.set(event.id, y);
  };

  return (
    <ThemedView style={styles.container}>
      <View 
        style={styles.header}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
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
            onCloseForm(0);
          }}
        />
      )}
      <EventList 
        onSelectEvent={handleEventSelect} 
        showHeader={false} 
        reloadTrigger={reloadTrigger}
          onEventPosition={handleEventPosition}
      />

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
