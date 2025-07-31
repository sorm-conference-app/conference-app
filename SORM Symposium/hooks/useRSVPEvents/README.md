# useRSVPEvents Hook

This hook fetches events that a specific user has RSVPed for, with real-time updates and caching support.

## Files

- `index.ts` - Main export file (throws error if called directly)
- `index.native.ts` - Native implementation with SQLite caching
- `index.web.ts` - Web implementation without caching

## Usage

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
The hook subscribes to changes in both:
- `events` table - when event details change
- `event_attendees` table - when RSVP status changes

### Caching (Native Only)
On native platforms, the hook caches:
- Event data in the `events` table
- RSVP data in the `event_attendees` table

### Automatic Filtering
- Only returns non-deleted events (`is_deleted: false`)
- Events are sorted by date and start time
- Returns empty array if no RSVPs found

## Parameters

- `deviceId` (string, required): The device ID to get RSVPed events for

## Returns

Returns a React Query result object with:
- `data`: Array of Event objects
- `isLoading`: Boolean indicating loading state
- `error`: Error object if query failed
- `refetch`: Function to manually refetch data

## Database Queries

The hook performs two sequential queries:
1. Gets event IDs from `event_attendees` table for the given device ID
2. Gets full event details from `events` table for those event IDs

This ensures we only fetch events that the user has actually RSVPed for. 