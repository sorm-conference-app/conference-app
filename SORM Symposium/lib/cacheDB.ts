import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { Platform } from "react-native";
import * as schema from "@/db/schema";

export function getCacheDatabase(dbName: string) {
  if (Platform.OS === "web") {
    return null;
  }

  const expo = openDatabaseSync(dbName);
  return drizzle<typeof schema>(expo);
}