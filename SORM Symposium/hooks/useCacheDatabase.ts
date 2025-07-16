import { useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";

/**
 * A hook that returns a Drizzle Database instance for the SQLite database.
 * @returns A Drizzle Database instance.
 */
function useCacheDatabase() {
  const db = useSQLiteContext();
  return useMemo(() => drizzle(db, { schema }), [db]);
}

export default useCacheDatabase;
