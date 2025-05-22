import { StyleSheet } from "react-native";
import { View, ScrollView } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { Stack } from "expo-router";
import { Announcement } from "@/components/Announcement";
import { Colors } from "@/constants/Colors";

type Announcement = {
  id: string;
  title: string;
  body: string;
};

// This would typically come from an API or database
export const announcements: Announcement[] = [
  {
    id: "1",
    title: "Welcome to the Symposium!",
    body: "We're excited to have you join us for the SORM Symposium. Please check the agenda for today's schedule.",
  },
  {
    id: "2",
    title: "Lunch Location Update",
    body: "Today's lunch will be served in the Main Hall instead of the previously announced location.",
  },
  {
    id: "3",
    title: "Keynote Speaker Announced",
    body: "We're excited to announce that Dr. John Smith will be our keynote speaker. He will be speaking on the topic of 'The Future of SORM'.",
  },
  {
    id: "4",
    title: "Announcement 4",
    body: "This is the body of the fourth announcement.",
  },
  {
    id: "5",
    title: "Announcement 5",
    body: "This is the body of the fifth announcement.",
  },
]; 

export default function AnnouncementsScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Announcements",
          headerShown: true,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {announcements.map((announcement) => (
            <Announcement
              key={announcement.id}
              title={announcement.title}
              body={announcement.body}
              useTruncation={false}
            />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.tabBarBackground,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
}); 