import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import { CacheDatabase } from ".";

const DATABASE_NAME = "cache.db";

export default function getCacheDatabase(): CacheDatabase {
  const expo = openDatabaseSync(DATABASE_NAME);
  return {
    db: drizzle<typeof schema>(expo),
    databaseName: DATABASE_NAME,
    SQLiteProvider
  };
}