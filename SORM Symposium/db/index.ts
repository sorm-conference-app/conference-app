import { drizzle } from 'drizzle-orm/expo-sqlite';
import { SQLiteProviderProps } from 'expo-sqlite';
import { FC } from 'react';
import * as schema from '@/db/schema';

export type CacheDatabase = {
  db: ReturnType<typeof drizzle<typeof schema>> | null;
  databaseName: string;
  SQLiteProvider: FC<SQLiteProviderProps> | null;
}

export default function getCacheDatabase(): CacheDatabase {
  throw new Error("Should not be called directly.");
}
