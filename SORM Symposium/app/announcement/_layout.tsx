import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import { Redirect, Stack } from "expo-router";

/**
 * Protects all announcement routes by redirecting unauthenticated users to login
 */
export default function AnnouncementLayout() {
  const session = useSupabaseAuth();

  // Redirect unauthenticated users to login page
  if (!session?.user) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
