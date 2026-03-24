import { sql } from "drizzle-orm";
import { int, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Note: Ensure to keep the tables in this file in sync with Supabase.
 *
 * To perform a migration, run:
 * `npx drizzle-kit generate`.
 *
 * If this fails, try the following instead:
 * `npm exec drizzle-kit generate`
 */

export const announcements = sqliteTable("announcements", {
  id: int().primaryKey({ autoIncrement: true }),
  created_at: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  body: text().notNull(),
  title: text().notNull(),
  type: text(),
});

export const contact_info = sqliteTable("contact_info", {
  id: int().primaryKey({ autoIncrement: true }),
  first_name: text().notNull(),
  last_name: text().notNull(),
  phone_number: text().notNull(),
  email: text().notNull(),
  created_at: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const events = sqliteTable("events", {
  id: int().primaryKey({ autoIncrement: true }),
  created_at: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  title: text().notNull(),
  description: text(),
  event_date: text().notNull(),
  start_time: text().notNull(),
  end_time: text().notNull(),
  location: text().notNull(),
  speaker_name: text(), // Will store array of speaker names
  speaker_title: text(), // Will store array of speaker titles
  speaker_bio: text(), // Will store array of speaker bios
  speaker_company: text(), // Will store array of speaker companies
  topic: text(),
  slides_url: text(),
  is_deleted: int().notNull().default(0),
});

export const event_attendees = sqliteTable("event_attendees", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int().notNull(),
  attendee_device_id: text(), // Allow null for web platforms
  attendee_id: int().notNull(),
  rsvp_at: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  notified: int().notNull().default(0),
});
