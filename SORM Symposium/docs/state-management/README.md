# State Management Guide

This document provides a comprehensive overview of state management in the SORM Symposium mobile application, covering the actual implementation patterns used in the project.

## 📋 Table of Contents

- [State Management Overview](#state-management-overview)
- [TanStack Query Implementation](#tanstack-query-implementation)
- [Platform-Specific Hooks](#platform-specific-hooks)
- [Offline Caching Strategy](#offline-caching-strategy)
- [Real-time Subscriptions](#real-time-subscriptions)
- [Local State Management](#local-state-management)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## 🏗️ State Management Overview

The SORM Symposium app uses a hybrid state management approach:

- **Server State**: TanStack Query for data fetching and caching
- **Local State**: React useState/useReducer for UI state and form data
- **Global State**: Context providers for authentication and app-wide state
- **Offline State**: SQLite cache with Drizzle ORM for offline functionality
- **Mutations**: Direct Supabase calls (not using TanStack Query mutations)

### Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Layer      │    │  State Layer    │    │   Data Layer    │
│                 │    │                 │    │                 │
│ Components      │◄──►│ TanStack Query  │◄──►│ Supabase API    │
│ Local State     │    │ (Queries Only)  │    │ SQLite Cache    │
│ Form State      │    │ Direct Calls    │    │ Edge Functions  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 TanStack Query Implementation

### Query Client Configuration

```typescript
// app/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Query client is configured in the app layout
<QueryClientProvider client={queryClient}>
  {/* App content */}
</QueryClientProvider>
```

### Query Pattern

The project uses TanStack Query primarily for **data fetching** with simple query keys and direct Supabase calls:

```typescript
// hooks/useEvents/index.native.ts
export default function useEvents(options?: {
  date?: string;
  showDeleted?: boolean;
}) {
  const queryKey = ["events", options?.date, options?.showDeleted];

  const { refetch, ...rest } = useQuery<Event[]>({
    queryKey,
    queryFn: async function () {
      let query = supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (options?.date) {
        query = query.eq("event_date", options.date);
      }

      if (options?.showDeleted === false) {
        query = query.eq("is_deleted", false);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as Event[];
    },
    refetchOnWindowFocus: false,
  });

  return { refetch, ...rest };
}
```

### Query Key Strategy

The project uses **simple, flat query keys** rather than complex nested structures:

```typescript
// Simple query keys used throughout the project
const queryKey = ["events", options?.date, options?.showDeleted];
const queryKey = ["contacts"];
const queryKey = ["announcements"];
const queryKey = ["rsvp-events", attendeeId];
```

## 📱 Platform-Specific Hooks

### Platform Detection Pattern

The project uses platform-specific implementations with a common interface:

```typescript
// hooks/useEvents/index.ts (main interface)
export default function useEvents(options?: {
  date?: string;
  showDeleted?: boolean;
}): ReturnType<typeof useQuery<Event[]>> {
  throw new Error("Should not be called directly.");
}

// hooks/useEvents/index.native.ts (native implementation)
export default function useEvents(options?: {
  date?: string;
  showDeleted?: boolean;
}) {
  // Native-specific implementation with SQLite caching
}

// hooks/useEvents/index.web.ts (web implementation)
export default function useEvents(options?: {
  date?: string;
  showDeleted?: boolean;
}) {
  // Web-specific implementation without caching
}
```

### Native Implementation Features

```typescript
// hooks/useEvents/index.native.ts
export default function useEvents(options?: {
  date?: string;
  showDeleted?: boolean;
}) {
  const cache = useCacheDatabase();
  const channelName = useRef(`events_changes_${Math.random().toString(36).substr(2, 9)}`);
  const hookId = useRef(`hook_${Math.random().toString(36).substr(2, 6)}`);

  const { refetch, ...rest } = useQuery<Event[]>({
    queryKey: ["events", options?.date, options?.showDeleted],
    queryFn: async function () {
      // Cache-only mode for testing
      if (CACHE_ONLY) {
        if (!cache) return [];
        try {
          const cachedEvents = await cache.select().from(events);
          return cachedEvents.map(event => ({
            ...event,
            created_at: event.created_at.toISOString(),
            is_deleted: Boolean(event.is_deleted),
            speaker_name: event.speaker_name ? JSON.parse(event.speaker_name) : null,
            // ... other field conversions
          })) as Event[];
        } catch (cacheError) {
          console.warn(`Failed to read from cache:`, cacheError);
          return [];
        }
      }

      // Normal network request with caching
      const { data, error } = await supabase.from("events").select("*");
      
      if (error) throw new Error(error.message);

      // Cache the fetched data
      if (cache) {
        try {
          await cache.insert(events).values(insertData);
        } catch (cacheError) {
          console.warn("Failed to cache events:", cacheError);
        }
      }

      return data as Event[];
    },
  });

  return { refetch, ...rest };
}
```

## 💾 Offline Caching Strategy

### SQLite Cache Implementation

```typescript
// hooks/useCacheDatabase.ts
export default function useCacheDatabase() {
  const [db, setDb] = useState<Database | null>(null);

  useEffect(() => {
    async function initDatabase() {
      const database = await getCacheDatabase();
      setDb(database);
    }
    initDatabase();
  }, []);

  return db;
}
```

### Data Transformation for Caching

```typescript
// Converting Supabase data for SQLite storage
const insertData = data.map((item) => ({
  ...item,
  created_at: new Date(item.created_at), // Convert to Date object for SQLite
  is_deleted: item.is_deleted ? 1 : 0, // Convert boolean to integer for SQLite
  // Convert arrays to JSON strings for SQLite storage
  speaker_name: item.speaker_name ? JSON.stringify(item.speaker_name) : null,
  speaker_title: item.speaker_title ? JSON.stringify(item.speaker_title) : null,
  speaker_bio: item.speaker_bio ? JSON.stringify(item.speaker_bio) : null,
  speaker_company: item.speaker_company ? JSON.stringify(item.speaker_company) : null,
}));
```

## 🔄 Real-time Subscriptions

### Supabase Channel Implementation

```typescript
// Real-time subscription setup in useEvents
useEffect(() => {
  const subscription = supabase
    .channel(channelName.current)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "events",
      },
      (payload) => {
        console.log(`[${hookId.current}] Event change:`, payload);
        refetch();
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [refetch]);
```

### Channel Management

```typescript
// Unique channel names to prevent conflicts
const channelName = useRef(`events_changes_${Math.random().toString(36).substr(2, 9)}`);
const hookId = useRef(`hook_${Math.random().toString(36).substr(2, 6)}`);
```

## 📱 Local State Management

### Authentication State

```typescript
// hooks/useSupabaseAuth.ts
export const useSupabaseAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, loading };
};
```

### Form State Management

```typescript
// hooks/useAdminPasswordChange.ts
export function useAdminPasswordChange(): UseAdminPasswordChangeReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState('');

  const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<void> => {
    setIsChangingPassword(true);
    setError('');

    try {
      // Direct Supabase call for mutation
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      hideModal();
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = (error as Error).message;
      setError(`Failed to change password: ${errorMessage}`);
      throw error;
    } finally {
      setIsChangingPassword(false);
    }
  }, [hideModal]);

  return {
    isVisible,
    isChangingPassword,
    error,
    changePassword,
    showModal,
    hideModal
  };
}
```

### Modal State Management

```typescript
// Simple modal state pattern
const [isVisible, setIsVisible] = useState(false);
const [isChangingPassword, setIsChangingPassword] = useState(false);
const [error, setError] = useState('');

const showModal = useCallback(() => setIsVisible(true), []);
const hideModal = useCallback(() => {
  setIsVisible(false);
  setError('');
}, []);
```

## ⚠️ Error Handling

### Query Error Handling

```typescript
// Simple error handling in queries
const { refetch, ...rest } = useQuery<Event[]>({
  queryKey: ["events", options?.date, options?.showDeleted],
  queryFn: async function () {
    const { data, error } = await supabase.from("events").select("*");
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Event[];
  },
  refetchOnWindowFocus: false,
});
```

### Mutation Error Handling

```typescript
// Error handling in direct Supabase calls
const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<void> => {
  setIsChangingPassword(true);
  setError('');

  try {
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      throw updateError;
    }

    hideModal();
  } catch (error) {
    console.error('Password change error:', error);
    const errorMessage = (error as Error).message;
    
    // Provide user-friendly error messages
    if (errorMessage.includes('Invalid login credentials')) {
      setError('Current password is incorrect. Please try again.');
    } else if (errorMessage.includes('Password should be')) {
      setError('Password does not meet requirements. Please try a different password.');
    } else {
      setError(`Failed to change password: ${errorMessage}`);
    }
    throw error;
  } finally {
    setIsChangingPassword(false);
  }
}, [hideModal]);
```

## 🔧 Best Practices

### 1. Platform-Specific Implementations

```typescript
// Always provide platform-specific implementations
// index.ts - Main interface
// index.native.ts - Native implementation with caching
// index.web.ts - Web implementation without caching
```

### 2. Simple Query Keys

```typescript
// Use simple, flat query keys
const queryKey = ["events", options?.date, options?.showDeleted];
const queryKey = ["contacts"];
const queryKey = ["announcements"];
```

### 3. Direct Supabase Calls for Mutations

```typescript
// Use direct Supabase calls instead of TanStack Query mutations
const { error } = await supabase.auth.updateUser({ password: newPassword });
const { error } = await supabase.from("events").insert(eventData);
```

### 4. Offline-First Approach

```typescript
// Implement caching for offline functionality
if (CACHE_ONLY) {
  // Use cached data when offline
  const cachedEvents = await cache.select().from(events);
  return cachedEvents;
}

// Cache network responses for offline use
if (cache) {
  await cache.insert(events).values(insertData);
}
```

### 5. Real-time Subscriptions

```typescript
// Set up real-time subscriptions for live updates
useEffect(() => {
  const subscription = supabase
    .channel(channelName.current)
    .on("postgres_changes", { event: "*", schema: "public", table: "events" }, (payload) => {
      refetch();
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, [refetch]);
```

### 6. Error Boundaries

```typescript
// Simple error handling with user-friendly messages
try {
  const { error } = await supabase.from("events").select("*");
  if (error) throw error;
} catch (error) {
  console.error('Query error:', error);
  // Handle error appropriately
}
```

## 🔗 Related Documentation

- [API Documentation](../api/README.md) - Backend integration patterns
- [Database Schema](../database/README.md) - Data structure and relationships
- [Authentication Guide](../auth/README.md) - Auth state management
- [Component Library](../components/README.md) - UI state patterns
