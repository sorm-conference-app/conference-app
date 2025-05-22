import { StyleSheet } from "react-native";
import { View, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Stack } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";

// Placeholder data for agenda items
const placeholderAgendaItems = [
  {
    id: "1",
    title: "Welcome and Registration",
    time: "8:00 AM - 9:00 AM",
    location: "Main Hall",
  },
  {
    id: "2",
    title: "Opening Keynote",
    time: "9:00 AM - 10:30 AM",
    location: "Auditorium A",
  },
  {
    id: "3",
    title: "Break",
    time: "10:30 AM - 11:00 AM",
    location: "Networking Area",
  },
];

export default function AgendaScreen() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? "light"].tint;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Agenda",
          headerShown: true,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <ThemedText style={styles.header} type="title">
            Today's Schedule
          </ThemedText>
          {placeholderAgendaItems.map((item) => (
            <View key={item.id} style={styles.agendaItem}>
              <ThemedText style={styles.title} type="defaultSemiBold">
                {item.title}
              </ThemedText>
              <ThemedText style={styles.time}>{item.time}</ThemedText>
              <ThemedText style={styles.location}>{item.location}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
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
  header: {
    marginBottom: 20,
  },
  agendaItem: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    marginBottom: 4,
  },
  time: {
    marginBottom: 4,
  },
  location: {
    opacity: 0.8,
  },
});
