import { StyleSheet, RefreshControl, ScrollView } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAttendeeContacts } from "@/hooks/useAttendeeContacts";
import React from "react";
import { Colors } from "@/constants/Colors";
import ContactRow from "./contactRow";

interface AttendeeContactListProps {
  reloadTrigger?: number;
}

export default function AttendeeContactList({ reloadTrigger }: AttendeeContactListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const { contacts, loading, error, refresh } = useAttendeeContacts();

  // Refresh contacts when reloadTrigger changes
  React.useEffect(() => {
    if (reloadTrigger) {
      refresh();
    }
  }, [reloadTrigger, refresh]);

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Error loading contacts: {error.message}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { 
        borderColor: Colors[colorScheme].tint,
        backgroundColor: Colors[colorScheme].secondaryBackgroundColor,
      }]}>
      <ThemedText style={styles.title}>Attendee Contact List</ThemedText>
      <ScrollView 
        style={[styles.contactList, { borderColor: Colors[colorScheme].tint, borderWidth: 1 }]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={colorScheme === 'dark' ? ['#ffffff'] : ['#000000']}
            tintColor={colorScheme === 'dark' ? '#ffffff' : '#000000'}
          />
        }
      >
        {contacts.map((contact) => <ContactRow attendee={contact} key={contact.id} />)}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    margin: 10,
  },
  contactList: {
    flex: 1,
    flexGrow: 1,
    margin: 10,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 10,
  },
});