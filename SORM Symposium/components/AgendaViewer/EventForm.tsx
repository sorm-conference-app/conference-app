import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors, TopicColors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import type { Event } from "@/types/Events.types";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { removeSecondsFromTime } from "./utils";

type EventFormProps = {
  event?: Event;
  onSubmit: (event: Event) => void;
  onCancel: () => void;
};

// Available topics for selection
const AVAILABLE_TOPICS = Object.keys(TopicColors);

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const colorScheme = useColorScheme() ?? "light";
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [startTime, setStartTime] = useState(event?.start_time ?? "");
  const [endTime, setEndTime] = useState(event?.end_time ?? "");
  const [eventDate, setEventDate] = useState(event?.event_date ?? "");
  const [speaker, setSpeaker] = useState(event?.speaker ?? "");
  const [slidesUrl, setSlidesUrl] = useState(event?.slides_url ?? "");
  const [speakerName, setSpeakerName] = useState(event?.speaker_name ?? "");
  const [speakerTitle, setSpeakerTitle] = useState(event?.speaker_title ?? "");
  const [speakerBio, setSpeakerBio] = useState(event?.speaker_bio ?? "");
  const [topic, setTopic] = useState(event?.topic ?? "General");
  const [canSubmit, setCanSubmit] = useState(event ? true : false);

  useEffect(() => {
    setTitle(event?.title ?? "");
    setDescription(event?.description ?? "");
    setLocation(event?.location ?? "");
    setStartTime(event?.start_time ?? "");
    setEndTime(event?.end_time ?? "");
    setEventDate(event?.event_date ?? "");
    setSpeaker(event?.speaker ?? "");
    setSlidesUrl(event?.slides_url ?? "");
    setSpeakerName(event?.speaker_name ?? "");
    setSpeakerTitle(event?.speaker_title ?? "");
    setSpeakerBio(event?.speaker_bio ?? "");
    setTopic(event?.topic ?? "General");
    setCanSubmit(event ? true : false);
  }, [event]);

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit({
      id: event?.id ?? 0,
      title,
      description,
      location,
      start_time: startTime,
      end_time: endTime,
      created_at: event?.created_at ?? new Date().toISOString(),
      speaker,
      slides_url: slidesUrl,
      event_date: eventDate,
      speaker_name: speakerName,
      speaker_title: speakerTitle,
      speaker_bio: speakerBio,
      is_deleted: false,
      topic: topic === "General" ? null : topic,
    });
  };

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].secondaryBackgroundColor },
      ]}
    >
      <ScrollView style={styles.scrollView}>
        <ThemedText type="subtitle" style={styles.title}>
          {event ? 'Editing "' + event.title + '"' : "Add New Event"}
        </ThemedText>

        <View style={styles.formGroup}>
          <ThemedText>Title *</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + "40",
              },
            ]}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              setCanSubmit(
                Boolean(
                  text &&
                    (title !== "Break" ? location : true) &&
                    startTime &&
                    endTime &&
                    eventDate
                )
              );
            }}
            placeholder="Event title"
            placeholderTextColor={Colors[colorScheme].text + "80"}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText>Topic</ThemedText>
          <View style={styles.topicContainer}>
            {AVAILABLE_TOPICS.map((topicOption) => (
              <Pressable
                key={topicOption}
                style={[
                  styles.topicOption,
                  {
                    backgroundColor:
                      topic === topicOption
                        ? TopicColors[topicOption as keyof typeof TopicColors]
                        : Colors[colorScheme].background,
                  },
                  {
                    borderColor:
                      TopicColors[topicOption as keyof typeof TopicColors],
                  },
                ]}
                onPress={() => setTopic(topicOption)}
              >
                <ThemedText
                  style={[
                    styles.topicOptionText,
                    {
                      color:
                        topic === topicOption
                          ? "white"
                          : Colors[colorScheme].text,
                    },
                  ]}
                >
                  {topicOption}
                </ThemedText>
              </Pressable>
            ))}
          </View>
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
                borderColor: Colors[colorScheme].text + "40",
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Event description"
            placeholderTextColor={Colors[colorScheme].text + "80"}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText>Location *</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + "40",
              },
            ]}
            value={location}
            onChangeText={(text) => {
              setLocation(text);
              setCanSubmit(
                Boolean(
                  title &&
                    (title !== "Break" ? text : true) &&
                    startTime &&
                    endTime &&
                    eventDate
                )
              );
            }}
            placeholder="Event location"
            placeholderTextColor={Colors[colorScheme].text + "80"}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText>Event Date *</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + "40",
              },
            ]}
            value={eventDate}
            onChangeText={(text) => {
              setEventDate(text);
              setCanSubmit(
                Boolean(
                  title &&
                    (title !== "Break" ? location : true) &&
                    startTime &&
                    endTime &&
                    text
                )
              );
            }}
            placeholder="MM-DD"
            placeholderTextColor={Colors[colorScheme].text + "80"}
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
                borderColor: Colors[colorScheme].text + "40",
              },
            ]}
            value={removeSecondsFromTime(startTime)}
            onChangeText={(text) => {
              setStartTime(text);
              setCanSubmit(
                Boolean(
                  title &&
                    (title !== "Break" ? location : true) &&
                    text &&
                    endTime &&
                    eventDate
                )
              );
            }}
            placeholder="e.g. 9:00 AM"
            placeholderTextColor={Colors[colorScheme].text + "80"}
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
                borderColor: Colors[colorScheme].text + "40",
              },
            ]}
            value={removeSecondsFromTime(endTime)}
            onChangeText={(text) => {
              setEndTime(text);
              setCanSubmit(
                Boolean(
                  title &&
                    (title !== "Break" ? location : true) &&
                    startTime &&
                    text &&
                    eventDate
                )
              );
            }}
            placeholder="e.g. 10:30 AM"
            placeholderTextColor={Colors[colorScheme].text + "80"}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.subtitleText}>
            Leave Speaker-related fields blank if not applicable
          </ThemedText>
        </View>

        <View style={styles.formGroup}>
          <ThemedText>Speaker</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + "40",
              },
            ]}
            value={speaker}
            onChangeText={setSpeaker}
            placeholder="Speaker name"
            placeholderTextColor={Colors[colorScheme].text + "80"}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText>Speaker Name</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + "40",
              },
            ]}
            value={speakerName}
            onChangeText={setSpeakerName}
            placeholder="Full name of the speaker"
            placeholderTextColor={Colors[colorScheme].text + "80"}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText>Speaker Title</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + "40",
              },
            ]}
            value={speakerTitle}
            onChangeText={setSpeakerTitle}
            placeholder="Speaker's title or position"
            placeholderTextColor={Colors[colorScheme].text + "80"}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText>Speaker Bio</ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + "40",
              },
            ]}
            value={speakerBio}
            onChangeText={setSpeakerBio}
            placeholder="Speaker's biography"
            placeholderTextColor={Colors[colorScheme].text + "80"}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText>Slides URL</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + "40",
              },
            ]}
            value={slidesUrl}
            onChangeText={setSlidesUrl}
            placeholder="URL to presentation slides"
            placeholderTextColor={Colors[colorScheme].text + "80"}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: canSubmit
                  ? Colors[colorScheme].adminButton
                  : Colors.light.tabIconDefault,
              },
              { borderColor: Colors[colorScheme].tint },
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <ThemedText
              style={[
                styles.buttonText,
                {
                  color: canSubmit
                    ? Colors[colorScheme].adminButtonText
                    : Colors[colorScheme].adminButtonText,
                },
              ]}
            >
              {event
                ? canSubmit
                  ? "Update Event"
                  : "Fill required fields *"
                : canSubmit
                ? "Add Event"
                : "Fill required fields *"}
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.button,
              { backgroundColor: Colors[colorScheme].adminButton },
              { borderColor: Colors[colorScheme].tint },
            ]}
            onPress={onCancel}
          >
            <ThemedText
              style={[
                styles.buttonText,
                { color: Colors[colorScheme].adminButtonText },
              ]}
            >
              Cancel
            </ThemedText>
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
    textAlign: "center",
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
    textAlignVertical: "top",
    paddingTop: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
  },
  subtitleText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 8,
  },
  topicContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  topicOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 80,
  },
  topicOptionText: {
    fontWeight: "bold",
    fontSize: 12,
  },
});
