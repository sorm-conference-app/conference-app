import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Note: Ensure to keep the tables in this file in sync with Supabase.
 * 
 * To perform a migration, run:
 * `npx drizzle-kit generate`.
 * 
 * If this fails, try the following instead:
 * `npm exec drizzle-kit generate`
 */

export const announcements = sqliteTable("test_announcements", {
  id: int().primaryKey({ autoIncrement: true }),
  created_at: int({ mode: "timestamp" }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
  body: text().notNull(),
  title: text().notNull()
});

export const contact_info = sqliteTable("contact_info", {
  id: int().primaryKey({ autoIncrement: true }),
  first_name: text().notNull(),
  last_name: text().notNull(),
  phone_number: text().notNull(),
  email: text().notNull(),
  created_at: int({ mode: "timestamp" }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
})