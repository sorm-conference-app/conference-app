import React from "react";
import { StyleSheet } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/Colors";

type AnnouncementProps = {
  title: string;
  body: string;
};

export function Announcement({ title, body}: AnnouncementProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText style={styles.body}>
        {body}
      </ThemedText>
    </ThemedView>
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