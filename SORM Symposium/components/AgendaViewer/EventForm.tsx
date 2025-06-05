import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Event } from './types';

type EventFormProps = {
  event?: Event;
  onSubmit: (event: Event) => void;
  onCancel: () => void;
};

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [location, setLocation] = useState(event?.location ?? '');
  const [startTime, setStartTime] = useState(event?.startTime ?? '');
  const [endTime, setEndTime] = useState(event?.endTime ?? '');
  const [canSubmit, setCanSubmit] = useState(event ? true : false);

  useEffect(() => {
    setTitle(event?.title ?? '');
    setDescription(event?.description ?? '');
    setLocation(event?.location ?? '');
    setStartTime(event?.startTime ?? '');
    setEndTime(event?.endTime ?? '');
    setCanSubmit(event ? true : false);
  }, [event]);

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit({
      id: event?.id ?? Date.now().toString(),
      title,
      description,
      location,
      startTime,
      endTime,
    });
  };

  return (
    <ThemedView style={[styles.container,
      { backgroundColor: Colors[colorScheme].secondaryBackgroundColor }
    ]}>
      <ScrollView style={styles.scrollView}>
        <ThemedText type="subtitle" style={styles.title}>
          {event ? 'Editing "' + event.title + '"' : 'Add New Event'}
        </ThemedText>

        <View style={styles.formGroup}>
          <ThemedText>Title *</ThemedText>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + '40',
              }
            ]}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              setCanSubmit(Boolean(text && startTime && endTime));
            }}
            placeholder="Event title"
            placeholderTextColor={Colors[colorScheme].text + '80'}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText>Description</ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { 
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + '40',
              }
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Event description"
            placeholderTextColor={Colors[colorScheme].text + '80'}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText>Location</ThemedText>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + '40',
              }
            ]}
            value={location}
            onChangeText={setLocation}
            placeholder="Event location"
            placeholderTextColor={Colors[colorScheme].text + '80'}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText>Start Time *</ThemedText>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + '40',
              }
            ]}
            value={startTime}
            onChangeText={(text) => {
              setStartTime(text);
              setCanSubmit(Boolean(title && text && endTime));
            }}
            placeholder="e.g. 9:00 AM"
            placeholderTextColor={Colors[colorScheme].text + '80'}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText>End Time *</ThemedText>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + '40',
              }
            ]}
            value={endTime}
            onChangeText={(text) => {
              setEndTime(text);
              setCanSubmit(Boolean(title && startTime && text));
            }}
            placeholder="e.g. 10:30 AM"
            placeholderTextColor={Colors[colorScheme].text + '80'}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.button,
              { backgroundColor: canSubmit ? Colors[colorScheme].adminButton : Colors.light.tabIconDefault },
              { borderColor: Colors[colorScheme].tint }
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <ThemedText style={[styles.buttonText,
              { color: canSubmit ? Colors[colorScheme].adminButtonText : Colors[colorScheme].adminButtonText }
            ]}>
              {event ? 
                canSubmit ? 'Update Event' : 'Fill required fields *'
              : canSubmit ? 'Add Event' : 'Fill required fields *'}
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.button,
              { backgroundColor: Colors[colorScheme].adminButton },
              { borderColor: Colors[colorScheme].tint }
            ]}
            onPress={onCancel}
          >
            <ThemedText style={[styles.buttonText,
              { color: Colors[colorScheme].adminButtonText }
            ]}>Cancel</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
  },
}); 