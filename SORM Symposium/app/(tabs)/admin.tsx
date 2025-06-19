import AnnouncementForm from "@/components/AnnouncementForm";
import { AgendaEditor } from "@/components/AgendaViewer/AgendaEditor";
import ContactEditForm from "@/components/ContactEditForm";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import { Redirect } from "expo-router";
import { useState, useRef } from "react";
import { SafeAreaView, ScrollView, StyleSheet, ViewStyle, View } from "react-native";
import useActiveUserCount from "@/hooks/useActiveUserCount";
import React from "react";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Admin() {
  const activeUsers = useActiveUserCount();
  const user = useSupabaseAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const agendaEditorRef = useRef<View>(null);

  if (!user) {
    return <Redirect href="/(tabs)/home" />;
  }

  const scrollToAgendaEditor = () => {
    if (scrollViewRef.current) {
      agendaEditorRef.current?.measure((x, y, width, height, pageX, pageY) => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: y, animated: true });
        }
      });
    }
  };

  const scrollToEvent = (eventY: number) => {
    if (eventY === 0) return;
    if (agendaEditorRef.current) {
        agendaEditorRef.current.measure((x, y, width, height, pageX, pageY) => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: y + eventY, animated: true });
          }
        });
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView>
          <ThemedText>Welcome to the admin panel! | Active Users:{" "}
          {Object.entries(activeUsers).map(([platform, count]) => (
            <>
              {capitalize(platform)}: {count}{" "}
            </>
          ))}
          </ThemedText>
        <AnnouncementForm />
        <ContactEditForm />
          <View ref={agendaEditorRef}>
            <AgendaEditor onShowForm={scrollToAgendaEditor} onCloseForm={scrollToEvent} />
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  } as ViewStyle,
  scrollView: {
    flex: 1,
  } as ViewStyle,
  scrollContent: {
    flexGrow: 1,
  } as ViewStyle,
});
