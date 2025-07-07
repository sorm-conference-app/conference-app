import { CacheDatabase } from ".";

export default function getCacheDatabase(): CacheDatabase {
  return {
    db: null, // No database instance for web
    databaseName: "cache.db",
    SQLiteProvider: null // No SQLiteProvider for web
  }
}