# Database Schema Documentation

This document provides a comprehensive overview of the database structure, relationships, and data management in the SORM Symposium mobile application.

## 📋 Table of Contents

- [Database Overview](#database-overview)
- [Schema Definition](#schema-definition)
- [Table Relationships](#table-relationships)
- [Data Types and Constraints](#data-types-and-constraints)
- [Migrations](#migrations)
- [Query Patterns](#query-patterns)
- [Performance Considerations](#performance-considerations)

## 🗄️ Database Overview

The application uses a hybrid database approach:

- **Primary Database**: Supabase (PostgreSQL) for production data
- **Local Cache**: SQLite (via Drizzle ORM) for offline functionality (when not on web)
- **Real-time Sync**: Supabase real-time subscriptions for live updates

### Architecture Benefits

- **Offline Support**: Local SQLite cache enables offline functionality
- **Real-time Updates**: Supabase subscriptions provide live data synchronization
- **Type Safety**: Drizzle ORM ensures type-safe database operations
- **Performance**: Local caching reduces network requests

## 📊 Schema Definition

### `announcements` Table

Stores system announcements and notifications.

```sql
CREATE TABLE announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TIMESTAMP NOT NULL DEFAULT (unixepoch()),
  body TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT
);
```

**Fields:**
- `id` - Unique identifier (auto-increment)
- `created_at` - Timestamp when announcement was created
- `body` - Announcement content
- `title` - Announcement title
- `type` - Announcement type (optional categorization)

**Usage:**
```typescript
import { announcements } from '@/db/schema';

// Create announcement
const newAnnouncement = await db.insert(announcements).values({
  title: 'Welcome to SORM Symposium',
  body: 'We are excited to have you here!',
  type: 'welcome'
});

// Query announcements
const allAnnouncements = await db.select().from(announcements);
```

### `contact_info` Table

Stores attendee contact information of the Symposium Planning Team to be shown in the Info tab.

```sql
CREATE TABLE contact_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT (unixepoch())
);
```

**Fields:**
- `id` - Unique identifier (auto-increment)
- `first_name` - Planning Team member's first name
- `last_name` - Planning Team member's last name
- `phone_number` - Contact phone number
- `email` - Contact email address
- `created_at` - Timestamp when contact was added

**Usage:**
```typescript
import { contact_info } from '@/db/schema';

// Add contact
const newContact = await db.insert(contact_info).values({
  first_name: 'John',
  last_name: 'Doe',
  phone_number: '+1234567890',
  email: 'john.doe@example.com'
});

// Query contacts
const contacts = await db.select().from(contact_info);
```

### `events` Table

Stores symposium events and sessions.

```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TIMESTAMP NOT NULL DEFAULT (unixepoch()),
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT NOT NULL,
  speaker_name TEXT, -- Array of speaker names
  speaker_title TEXT, -- Array of speaker titles
  speaker_bio TEXT, -- Array of speaker bios
  speaker_company TEXT, -- Array of speaker companies
  topic TEXT,
  slides_url TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0
);
```

**Fields:**
- `id` - Unique identifier (auto-increment)
- `created_at` - Timestamp when event was created
- `title` - Event title
- `description` - Event description
- `event_date` - Date of the event (YYYY-MM-DD format)
- `start_time` - Event start time (HH:MM format)
- `end_time` - Event end time (HH:MM format)
- `location` - Event location/room
- `speaker_name` - JSON array of speaker names
- `speaker_title` - JSON array of speaker titles
- `speaker_bio` - JSON array of speaker biographies
- `speaker_company` - JSON array of speaker companies
- `topic` - Event topic/category
- `slides_url` - URL to presentation slides (storage in Supabase)
- `is_deleted` - Soft delete flag (0 = active, 1 = deleted)

**Usage:**
```typescript
import { events } from '@/db/schema';

// Create event
const newEvent = await db.insert(events).values({
  title: 'Keynote Address',
  description: 'Opening keynote speech',
  event_date: '2024-01-15',
  start_time: '09:00',
  end_time: '10:00',
  location: 'Main Hall',
  speaker_name: JSON.stringify(['Dr. Jane Smith']),
  speaker_title: JSON.stringify(['CEO']),
  speaker_company: JSON.stringify(['Tech Corp']),
  topic: 'keynote'
});

// Query active events
const activeEvents = await db
  .select()
  .from(events)
  .where(eq(events.is_deleted, 0));
```

### `event_attendees` Table

Tracks event RSVPs and attendance.

```sql
CREATE TABLE event_attendees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  attendee_device_id TEXT, -- Null for web platforms
  attendee_id INTEGER NOT NULL,
  rsvp_at TIMESTAMP NOT NULL DEFAULT (unixepoch()),
  notified INTEGER NOT NULL DEFAULT 0
);
```

**Fields:**
- `id` - Unique identifier (auto-increment)
- `event_id` - Foreign key to events table
- `attendee_device_id` - Device identifier (null for web)
- `attendee_id` - Attendee identifier
- `rsvp_at` - Timestamp when RSVP was made
- `notified` - Notification status (0 = not notified, 1 = notified)

**Usage:**
```typescript
import { event_attendees } from '@/db/schema';

// RSVP to event
const rsvp = await db.insert(event_attendees).values({
  event_id: 1,
  attendee_device_id: 'device-123',
  attendee_id: 456
});

// Get event attendees
const attendees = await db
  .select()
  .from(event_attendees)
  .where(eq(event_attendees.event_id, 1));
```

## 🔗 Table Relationships

### Entity Relationship Diagram

```
events (1) ←→ (many) event_attendees
  ↓
contact_info (independent)
  ↓
announcements (independent)
```

### Foreign Key Relationships

1. **events → event_attendees**
   - `event_attendees.event_id` references `events.id`
   - One event can have many attendees
   - Cascade delete when event is removed

### Data Integrity Constraints

```typescript
// Example constraints
export const events = sqliteTable("events", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(), // Required field
  event_date: text().notNull(), // Required field
  is_deleted: int().notNull().default(0), // Default value
});
```

## 📝 Data Types and Constraints

### Supported Data Types

- **INTEGER** - Whole numbers (auto-increment, foreign keys)
- **TEXT** - String data (names, descriptions, URLs)
- **TIMESTAMP** - Date/time data (created_at, rsvp_at)
- **JSON Arrays** - Speaker data stored as JSON strings

### Validation Rules

```typescript
// Example validation patterns
const validationRules = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Email format
  phone: /^\+?[\d\s\-\(\)]+$/, // Phone number format
  date: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD format
  time: /^\d{2}:\d{2}$/, // HH:MM format
};
```

## 🔄 Migrations

### Migration Process

1. **Generate Migration:**
   ```bash
   npx drizzle-kit generate
   ```

2. **Apply Migration:**
   ```bash
   npx drizzle-kit migrate
   ```

3. **Reset Database:**
   ```bash
   npx drizzle-kit drop
   npx drizzle-kit migrate
   ```

### Migration Files

Migrations are stored in the `drizzle/` directory:

```
drizzle/
├── meta/
│   └── _journal.json
└── migrations/
    ├── 0001_initial.sql
    ├── 0002_add_speakers.sql
    └── 0003_add_notifications.sql
```

### Migration Best Practices

1. **Always backup data** before running migrations
2. **Test migrations** in development environment first
3. **Use descriptive names** for migration files
4. **Include rollback scripts** for critical changes
5. **Document breaking changes** in migration comments

## 🔍 Query Patterns

### Common Query Patterns

#### 1. Event Queries

```typescript
// Get all active events
const activeEvents = await db
  .select()
  .from(events)
  .where(eq(events.is_deleted, 0))
  .orderBy(events.event_date, events.start_time);

// Get events by date
const eventsByDate = await db
  .select()
  .from(events)
  .where(eq(events.event_date, '2024-01-15'));

// Get events with speaker information
const eventsWithSpeakers = await db
  .select({
    id: events.id,
    title: events.title,
    speaker_names: events.speaker_name,
    speaker_companies: events.speaker_company
  })
  .from(events)
  .where(eq(events.is_deleted, 0));
```

#### 2. Attendance Queries

```typescript
// Get event attendance count
const attendanceCount = await db
  .select({ count: sql`count(*)` })
  .from(event_attendees)
  .where(eq(event_attendees.event_id, eventId));

// Get attendee's RSVPs
const userRSVPs = await db
  .select()
  .from(event_attendees)
  .where(eq(event_attendees.attendee_id, attendeeId));
```

#### 3. Contact Queries

```typescript
// Search contacts by name
const searchContacts = await db
  .select()
  .from(contact_info)
  .where(
    or(
      like(contact_info.first_name, `%${searchTerm}%`),
      like(contact_info.last_name, `%${searchTerm}%`)
    )
  )
  .maybeSingle();
```

### Complex Queries

#### Event with Attendance Count

```typescript
const eventsWithAttendance = await db
  .select({
    event: events,
    attendeeCount: sql`count(${event_attendees.id})`
  })
  .from(events)
  .leftJoin(event_attendees, eq(events.id, event_attendees.event_id))
  .where(eq(events.is_deleted, 0))
  .groupBy(events.id);
```

## ⚡ Performance Considerations

### Indexing Strategy

```sql
-- Recommended indexes
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_deleted ON events(is_deleted);
CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_attendee ON event_attendees(attendee_id);
CREATE INDEX idx_contact_info_email ON contact_info(email);
```

### Query Optimization

1. **Use specific column selection** instead of `SELECT *`
2. **Add WHERE clauses** to limit result sets
3. **Use appropriate indexes** for frequently queried columns
4. **Implement pagination** for large datasets
5. **Cache frequently accessed data** in memory
6. **Use .maybeSingle() clauses** if the target data might not exist

### Caching Strategy

```typescript
// Example caching with TanStack Query
const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

## 🔒 Security Considerations

### Data Protection

1. **Input Validation** - Validate all user inputs
2. **SQL Injection Prevention** - Use parameterized queries
3. **Access Control** - Implement row-level security
4. **Data Encryption** - Encrypt sensitive data at rest
5. **Audit Logging** - Log all database operations

### Row Level Security (RLS)

```sql
-- Example RLS policies for Supabase
CREATE POLICY "Users can view their own contacts" ON contact_info
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all events" ON events
  FOR ALL USING (auth.role() = 'admin');
```

## 📊 Data Synchronization

### Sync Strategy

1. **Real-time Updates** - Use Supabase subscriptions
2. **Conflict Resolution** - Implement last-write-wins strategy
3. **Offline Support** - Queue changes for sync when online
4. **Data Validation** - Validate data before sync

### Sync Implementation

```typescript
// Example sync implementation
const syncData = async () => {
  const localChanges = await getLocalChanges();
  
  for (const change of localChanges) {
    try {
      await syncToSupabase(change);
      await markAsSynced(change.id);
    } catch (error) {
      await queueForRetry(change);
    }
  }
};
```

## 🔗 Related Documentation

- [API Documentation](../api/README.md) - Database operations via API
- [State Management](../state-management/README.md) - Data flow patterns
- [Authentication Guide](../auth/README.md) - User data management
