import AnnouncementForm from "@/components/AnnouncementForm";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import { SafeAreaView } from "react-native";
import { Redirect } from "expo-router";
import useActiveUserCount from "@/hooks/useActiveUserCount";

export default function Admin() {
  const activeUsers = useActiveUserCount();
  const user = useSupabaseAuth();

  if (!user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView>
      <ThemedView>
        <ThemedText>
          Welcome to the admin panel! | Active Users: {activeUsers}
        </ThemedText>
        <AnnouncementForm />
      </ThemedView>
    </SafeAreaView>
  );
}
