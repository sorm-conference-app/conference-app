import { ThemedView } from "@/components/ThemedView";
import type { Event } from "@/types/Events.types";
import { Stack, router } from "expo-router";
import { StyleSheet } from "react-native";
import { EventList } from "@/components/AgendaViewer/EventList";
import { useState } from "react";

export default function AgendaScreen() {
  const [showSaved, setShowSaved] = useState<'active' | 'saved' | "all" | "deleted">('active');

  const navigateToEvent = (event: Event) => {
    router.push({
      pathname: "/event/[id]",
      params: { id: event.id.toString() },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Agenda",
          headerShown: true,
        }}
      />
      <EventList 
        onSelectEvent={navigateToEvent} 
        onEventPosition={() => {}} // No use for event postions in this screen
        showHeader={true} 
        showDeleted={showSaved}
        setShowDeleted={setShowSaved}
        reloadTrigger={1} // Reload trigger not used on this screen
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  conflictContent: {
    gap: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  header: {
    marginTop: 16,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 20,
  },
  dateHeader: {
    marginBottom: 12,
  },
  dateSection: {
    marginBottom: 24,
  },
  loadingText: {
    padding: 16,
    textAlign: "center",
  },
  errorText: {
    padding: 16,
    textAlign: "center",
    color: "red",
  },
  noEventsText: {
    padding: 16,
    textAlign: "center",
  },
});
