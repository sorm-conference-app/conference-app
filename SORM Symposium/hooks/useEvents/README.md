# Events Caching Hooks

This directory contains hooks for caching events and RSVPed events, following the same pattern as the announcements and contacts caching hooks.

## Files

- `index.ts` - Main export file (throws error if called directly)
- `index.native.ts` - Native implementation with SQLite caching
- `index.web.ts` - Web implementation without caching

## Usage

### useEvents Hook

The `useEvents` hook fetches all events from Supabase with real-time updates and optional filtering.

```typescript
import useEvents from "@/hooks/useEvents";

function MyComponent() {
  // Get all events (excluding deleted ones)
  const { data: events, isLoading, error } = useEvents({ showDeleted: false });

  // Get events for a specific date
  const { data: dateEvents } = useEvents({ 
    date: "2024-01-15", 
    showDeleted: false 
  });

  // Get all events including deleted ones
  const { data: allEvents } = useEvents({ showDeleted: true });

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      {events?.map(event => (
        <Text key={event.id}>{event.title}</Text>
      ))}
    </View>
  );
}
```

### useRSVPEvents Hook

The `useRSVPEvents` hook fetches events that a specific user has RSVPed for.

```typescript
import useRSVPEvents from "@/hooks/useRSVPEvents";
import { getDeviceId } from "@/lib/user";

function MyRSVPComponent() {
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    getDeviceId().then(setDeviceId);
  }, []);

  const { data: rsvpEvents, isLoading, error } = useRSVPEvents(deviceId);

  if (!deviceId) return <Text>Loading device ID...</Text>;
  if (isLoading) return <Text>Loading RSVPed events...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      <Text>My RSVPed Events ({rsvpEvents?.length || 0})</Text>
      {rsvpEvents?.map(event => (
        <Text key={event.id}>{event.title}</Text>
      ))}
    </View>
  );
}
```

## Features

### Real-time Updates
Both hooks subscribe to real-time changes in the database:
- `useEvents` listens to changes in the `events` table
- `useRSVPEvents` listens to changes in both `events` and `event_attendees` tables

### Caching (Native Only)
On native platforms, the hooks cache data in SQLite:
- Events are cached in the `events` table
- RSVP data is cached in the `event_attendees` table
- Data is automatically updated when changes occur

### Filtering Options
The `useEvents` hook supports:
- `date`: Filter events by specific date (YYYY-MM-DD format)
- `showDeleted`: Whether to include deleted events (default: true)

### Error Handling
Both hooks provide proper error handling and loading states through React Query.

## Database Schema

The hooks work with the following database tables:

### events
- `id` (primary key)
- `title`
- `description`
- `event_date`
- `start_time`
- `end_time`
- `location`
- `speaker_name`
- `speaker_title`
- `speaker_email`
- `topic`
- `slides_url`
- `is_deleted`
- `created_at`

### event_attendees
- `id` (primary key)
- `event_id` (foreign key to events.id)
- `attendee_device_id`
- `rsvp_at`
- `notified`

## Migration

To update the database schema, run:
```bash
npx drizzle-kit generate
```

This will create migration files for the new `events` and `event_attendees` tables. 