import React, { useState } from "react";
import { StyleSheet, TextLayoutEventData, Pressable } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

type AnnouncementProps = {
  title: string;
  body: string;
  useTruncation?: boolean;
};

export function Announcement({ title, body, useTruncation = true }: AnnouncementProps) {
  const [showFullText, setShowFullText] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';

  const handleTextLayout = (event: { nativeEvent: TextLayoutEventData }) => {
    const { lines } = event.nativeEvent;
    if (useTruncation && lines.length > 2) {
      setShowFullText(false);
    }
  };

  return (
    <Pressable onPress={() => useTruncation && setShowFullText(!showFullText)}>
      <ThemedView style={
        [styles.container, 
        { backgroundColor: Colors[colorScheme].background },
        { borderColor: Colors[colorScheme].text },
        ]}>
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