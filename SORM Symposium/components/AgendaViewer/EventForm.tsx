import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors, TopicColors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import type { Event } from "@/types/Events.types";
import { parseSpeakerString, formatSpeakersForDisplay } from "@/lib/speakerUtils";
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
  const [slidesUrl, setSlidesUrl] = useState(event?.slides_url ?? "");
  const [speakerNames, setSpeakerNames] = useState<string[]>([]);
  const [speakerTitles, setSpeakerTitles] = useState<string[]>([]);
  const [speakerBios, setSpeakerBios] = useState<string[]>([]);
  const [speakerCompanies, setSpeakerCompanies] = useState<string[]>([]);
  const [topic, setTopic] = useState(event?.topic ?? "General");
  const [canSubmit, setCanSubmit] = useState(event ? true : false);

  useEffect(() => {
    setTitle(event?.title ?? "");
    setDescription(event?.description ?? "");
    setLocation(event?.location ?? "");
    setStartTime(event?.start_time ?? "");
    setEndTime(event?.end_time ?? "");
    setEventDate(event?.event_date ?? "");
    setSlidesUrl(event?.slides_url ?? "");
    
    // Use speaker data directly as arrays from Supabase
    setSpeakerNames(event?.speaker_name ?? []);
    setSpeakerTitles(event?.speaker_title ?? []);
    setSpeakerBios(event?.speaker_bio ?? []);
    setSpeakerCompanies(event?.speaker_company ?? []);
    
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
      slides_url: slidesUrl,
      event_date: eventDate,
      speaker_name: speakerNames.length > 0 ? speakerNames : null,
      speaker_title: speakerTitles.length > 0 ? speakerTitles : null,
      speaker_bio: speakerBios.length > 0 ? speakerBios : null,
      speaker_company: speakerCompanies.length > 0 ? speakerCompanies : null,
      is_deleted: event?.is_deleted ?? false,
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
                    (topic !== "Break" ? location : true) &&
                    startTime &&
                    endTime &&
                    eventDate
                )
              );
            }}
            placeholder="Event title"
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            accessibilityLabel="Event title input field (required)"
            accessibilityRole="text"
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
                          ? "black"
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
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            multiline
            numberOfLines={4}
            accessibilityLabel="Event description input field"
            accessibilityRole="text"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText>
            {topic === "Break" ? "Location" : "Location *"}
          </ThemedText>
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
                    (topic !== "Break" ? text : true) &&
                    startTime &&
                    endTime &&
                    eventDate
                )
              );
            }}
            placeholder="Event location"
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            accessibilityLabel="Event location input field (required unless title is Break)"
            accessibilityRole="text"
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
                    (topic !== "Break" ? location : true) &&
                    startTime &&
                    endTime &&
                    text
                )
              );
            }}
            placeholder="MM-DD"
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            accessibilityLabel="Event date input field (required)"
            accessibilityRole="text"
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
                    (topic !== "Break" ? location : true) &&
                    text &&
                    endTime &&
                    eventDate
                )
              );
            }}
            placeholder="e.g. 9:00 AM"
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            accessibilityLabel="Start time input field (required)"
            accessibilityRole="text"
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
                    (topic !== "Break" ? location : true) &&
                    startTime &&
                    text &&
                    eventDate
                )
              );
            }}
            placeholder="e.g. 10:30 AM"
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            accessibilityLabel="End time input field (required)"
            accessibilityRole="text"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.subtitleText}>
            Leave Speaker-related fields blank if not applicable
          </ThemedText>
        </View>

        <View style={styles.formGroup}>
          <ThemedText>Speaker Names</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + "40",
              },
            ]}
            value={speakerNames.join('; ')}
            onChangeText={(text) => {
              const names = text.split(';').map(name => name.trim()).filter(name => name.length > 0);
              setSpeakerNames(names);
            }}
            placeholder="Speaker names separated by semicolons"
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            accessibilityLabel="Speaker names input field"
            accessibilityRole="text"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText>Speaker Titles</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + "40",
              },
            ]}
            value={speakerTitles.join('; ')}
            onChangeText={(text) => {
              const titles = text.split(';').map(title => title.trim()).filter(title => title.length > 0);
              setSpeakerTitles(titles);
            }}
            placeholder="Speaker titles separated by semicolons"
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            accessibilityLabel="Speaker titles input field"
            accessibilityRole="text"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText>Speaker Companies</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + "40",
              },
            ]}
            value={speakerCompanies.join('; ')}
            onChangeText={(text) => {
              const companies = text.split(';').map(company => company.trim()).filter(company => company.length > 0);
              setSpeakerCompanies(companies);
            }}
            placeholder="Speaker companies separated by semicolons"
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            accessibilityLabel="Speaker companies input field"
            accessibilityRole="text"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText>Speaker Bios</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].text + "40",
              },
            ]}
            value={speakerBios.join('; ')}
            onChangeText={(text) => {
              const bios = text.split(';').map(bio => bio.trim()).filter(bio => bio.length > 0);
              setSpeakerBios(bios);
            }}
            placeholder="Speaker bios separated by semicolons"
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            accessibilityLabel="Speaker bios input field"
            accessibilityRole="text"
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
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            accessibilityLabel="Slides URL input field"
            accessibilityRole="text"
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
            accessibilityLabel="Submit event button"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
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
            accessibilityLabel="Cancel event button"
            accessibilityRole="button"
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
