# API Documentation

This document provides a comprehensive reference for all API functions in the SORM Symposium mobile application.

## 📋 Table of Contents

- [Authentication APIs](#authentication-apis)
- [Event Management APIs](#event-management-apis)
- [Notification APIs](#notification-apis)
- [Networking APIs](#networking-apis)
- [Database Operations](#database-operations)
- [Supabase Edge Functions](#supabase-edge-functions)

## 🔐 Authentication APIs

### `signinAdmin(email: string, password: string, onSuccess?: () => void)`

Signs in an admin user with email and password authentication.

**Parameters:**
- `email` (string): Admin's email address
- `password` (string): Admin's password
- `onSuccess` (optional function): Callback executed after successful authentication

**Returns:**
```typescript
{
  user: User | null;
  session: Session | null;
  isUsingDefaultPassword: boolean;
}
```

**Example:**
```typescript
import signinAdmin from '@/api/signinUser';

try {
  const result = await signinAdmin('admin@example.com', 'password123', () => {
    console.log('Login successful!');
  });
  
  if (result.isUsingDefaultPassword) {
    // Prompt user to change password
  }
} catch (error) {
  console.error('Login failed:', error.message);
}
```

**Error Handling:**
- Throws error if email is not registered
- Throws error if email is registered as attendee (not admin)
- Throws error for invalid credentials
- Returns password status for default password detection

### `requestOTP(contact: string, attendeeEmail: string, bypassAdminCheck?: boolean)`

Requests OTP verification for attendee authentication.

**Parameters:**
- `contact` (string): Email address or phone number for verification
- `attendeeEmail` (string): Email used for symposium registration
- `bypassAdminCheck` (optional boolean): Skip admin email verification

**Returns:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Example:**
```typescript
import { requestOTP } from '@/api/signinUser';

try {
  const result = await requestOTP(
    '+1234567890', 
    'attendee@example.com'
  );
  
  if (result.success) {
    // Show OTP input screen
  }
} catch (error) {
  console.error('OTP request failed:', error.message);
}
```

### `verifyOTP(contact: string, otp: string, attendeeEmail: string)`

Verifies OTP code for attendee authentication.

**Parameters:**
- `contact` (string): Email or phone used for OTP
- `otp` (string): One-time password code
- `attendeeEmail` (string): Registration email for attendee identification

**Returns:**
```typescript
{
  success: boolean;
  attendee: AttendeeData | null;
  message: string;
}
```

**Example:**
```typescript
import { verifyOTP } from '@/api/signinUser';

try {
  const result = await verifyOTP('+1234567890', '123456', 'attendee@example.com');
  
  if (result.success && result.attendee) {
    // Complete authentication, store attendee data
  }
} catch (error) {
  console.error('OTP verification failed:', error.message);
}
```

## 📅 Event Management APIs

### Event CRUD Operations

All event management functions are located in the `hooks/useEvents/` directory with platform-specific implementations.

**Available Operations:**
- `fetchEvents()` - Retrieve all events
- `createEvent(eventData)` - Create new event
- `updateEvent(id, eventData)` - Update existing event
- `deleteEvent(id)` - Delete event
- `rsvpToEvent(eventId, attendeeId)` - RSVP to event

**Example:**
```typescript
import { useEvents } from '@/hooks/useEvents';

function EventManager() {
  const { events, createEvent, updateEvent } = useEvents();
  
  const handleCreateEvent = async () => {
    const newEvent = {
      title: 'Keynote Speech',
      description: 'Opening keynote address',
      startTime: new Date(),
      endTime: new Date(),
      location: 'Main Hall'
    };
    
    await createEvent(newEvent);
  };
}
```

## 🔔 Notification APIs

### `saveExpoPushToken(token: string, deviceId: string)`

Saves Expo push token to the database for push notifications.

**Parameters:**
- `token` (string): Expo push token from `Notifications.getExpoPushTokenAsync()`
- `deviceId` (string): Unique device identifier

**Returns:**
- Promise that resolves when token is saved
- Throws error if database operation fails

**Example:**
```typescript
import saveExpoPushToken from '@/api/saveExpoPushToken';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const registerForPushNotifications = async () => {
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id'
    });
    
    await saveExpoPushToken(token.data, Device.osInternalBuildId);
  } catch (error) {
    console.error('Failed to register for push notifications:', error);
  }
};
```

## 👥 Networking APIs

### Contact Management

Contact-related functions are in the `hooks/useContacts/` directory.

**Available Operations:**
- `fetchContacts()` - Get attendee contact list
- `addContact(contactData)` - Add new contact
- `updateContact(id, contactData)` - Update contact information
- `deleteContact(id)` - Remove contact
- `shareContact(contactId)` - Share contact with other attendees

**Example:**
```typescript
import { useContacts } from '@/hooks/useContacts';

function ContactManager() {
  const { contacts, addContact, shareContact } = useContacts();
  
  const handleAddContact = async () => {
    const newContact = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company: 'Tech Corp'
    };
    
    await addContact(newContact);
  };
}
```

## 🗄️ Database Operations

### Supabase Client

The main database client is configured in `constants/supabase.ts`:

```typescript
import { supabase } from '@/constants/supabase';

// Example queries
const { data, error } = await supabase
  .from('events')
  .select('*')
  .eq('date', '2024-01-15');

if (error) {
  console.error('Database error:', error);
} else {
  console.log('Events:', data);
}
```

### Real-time Subscriptions

```typescript
// Subscribe to real-time updates
const subscription = supabase
  .channel('events')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'events' },
    (payload) => {
      console.log('Event change:', payload);
    }
  )
  .subscribe();
```

## ⚡ Supabase Edge Functions

### `check-default-password`

**Purpose:** Verifies if a password matches the default admin password

**Endpoint:** `supabase.functions.invoke('check-default-password')`

**Request Body:**
```typescript
{
  password: string;
}
```

**Response:**
```typescript
{
  isDefaultPassword: boolean;
}
```

### `event-alerts`

**Purpose:** Sends push notifications for event updates

**Endpoint:** `supabase.functions.invoke('event-alerts')`

**Request Body:**
```typescript
{
  eventId: string;
  message: string;
  type: 'update' | 'reminder' | 'cancellation';
}
```

### `push_notifications`

**Purpose:** Manages push notification delivery

**Endpoint:** `supabase.functions.invoke('push_notifications')`

**Request Body:**
```typescript
{
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
}
```

## 🔧 Error Handling

All API functions follow consistent error handling patterns:

```typescript
try {
  const result = await apiFunction(params);
  // Handle success
} catch (error) {
  if (error.message.includes('Invalid login credentials')) {
    // Handle specific error
  } else {
    // Handle generic error
    console.error('API Error:', error.message);
  }
}
```

## 📊 Response Formats

### Success Response
```typescript
{
  success: true;
  data?: any;
  message?: string;
}
```

### Error Response
```typescript
{
  success: false;
  error: string;
  details?: any;
}
```

## 🔒 Security Considerations

- All API calls use Supabase's built-in security
- Row Level Security (RLS) policies protect data
- Authentication tokens are managed by Supabase Auth
- Sensitive operations require proper authorization
- Input validation occurs on both client and server

## 📝 Best Practices

1. **Always handle errors** - Wrap API calls in try-catch blocks
2. **Use TypeScript** - Leverage type safety for API responses
3. **Implement loading states** - Show loading indicators during API calls
4. **Cache responses** - Use TanStack Query for efficient data caching
5. **Validate inputs** - Check parameters before making API calls
6. **Log errors** - Record errors for debugging and monitoring

## 🔗 Related Documentation

- [Authentication Guide](../auth/README.md) - Detailed auth flow documentation
- [Database Schema](../database/README.md) - Database structure and relationships
- [State Management](../state-management/README.md) - TanStack Query patterns
