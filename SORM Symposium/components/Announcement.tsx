import React, { useState } from "react";
import { StyleSheet, TextLayoutEventData, Pressable } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/Colors";

type AnnouncementProps = {
  title: string;
  body: string;
};

export function Announcement({ title, body}: AnnouncementProps) {
  const [showFullText, setShowFullText] = useState(true);

  const handleTextLayout = (event: { nativeEvent: TextLayoutEventData }) => {
    const { lines } = event.nativeEvent;
    if (lines.length > 2) {
      setShowFullText(false);
    }
  };

  return (
    <Pressable onPress={() => setShowFullText(!showFullText)}>
      <ThemedView style={styles.container}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText 
          style={styles.body}
          onTextLayout={handleTextLayout}
          numberOfLines={showFullText ? undefined : 2}
        >
          {body}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'white',
    marginBottom: 12,
  },
  title: {
    marginBottom: 8,
  },
  body: {
    lineHeight: 20,
  },
}); 