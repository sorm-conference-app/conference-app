import { StyleSheet } from "react-native";
import { View, ScrollView, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Stack, router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";

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
  const tintColor = Colors[useColorScheme() ?? "light"].tint;

  const navigateToEvent = (id: string) => {
    router.push({
      pathname: "/event/[id]",
      params: { id },
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <ThemedText style={styles.header} type="title">
            Today's Schedule
          </ThemedText>
          {placeholderAgendaItems.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.agendaItem,
                pressed && styles.agendaItemPressed,
              ]}
              onPress={() => navigateToEvent(item.id)}
            >
              <ThemedView style={styles.agendaContent}>
                <ThemedText style={styles.title} type="defaultSemiBold">
                  {item.title}
                </ThemedText>
                <ThemedView style={styles.infoRow}>
                  <IconSymbol name="clock.fill" size={16} color={tintColor} />
                  <ThemedText style={styles.time}>{item.time}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.infoRow}>
                  <IconSymbol
                    name="mappin.circle.fill"
                    size={16}
                    color={tintColor}
                  />
                  <ThemedText style={styles.location}>
                    {item.location}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <IconSymbol name="chevron.right" size={20} color={tintColor} />
            </Pressable>
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
    flexDirection: "row",
    alignItems: "center",
  },
  agendaItemPressed: {
    opacity: 0.7,
  },
  agendaContent: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  title: {
    marginBottom: 8,
  },
  time: {
    flex: 1,
  },
  location: {
    flex: 1,
  },
});
