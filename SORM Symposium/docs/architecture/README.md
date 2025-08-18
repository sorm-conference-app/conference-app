# System Architecture

This document provides a comprehensive overview of the SORM Symposium mobile application architecture, including system design, data flow, and technical decisions.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Architecture Layers](#architecture-layers)
- [Data Flow](#data-flow)
- [Security Model](#security-model)
- [Performance Considerations](#performance-considerations)
- [Technical Decisions](#technical-decisions)
- [Deployment Architecture](#deployment-architecture)

## 🏗️ System Overview

The SORM Symposium app is built as a cross-platform mobile application with a hybrid architecture that prioritizes offline functionality, real-time updates, and scalability.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  React Native App (iOS/Android/Web)                            │
│  ├── Expo Router (Navigation)                                  │
│  ├── TanStack Query (Data Fetching)                           │
│  ├── SQLite Cache (Offline Storage)                           │
│  └── Custom Components (UI Layer)                             │
├─────────────────────────────────────────────────────────────────┤
│                      Communication Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  HTTPS/REST APIs                                               │
│  WebSocket (Real-time)                                         │
│  Push Notifications                                            │
├─────────────────────────────────────────────────────────────────┤
│                      Backend Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Platform                                             │
│  ├── PostgreSQL Database                                       │
│  ├── Authentication Service                                    │
│  ├── Real-time Subscriptions                                   │
│  ├── Edge Functions                                            │
│  └── Storage (Files/Images)                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Real-time Updates**: Live data synchronization via Supabase channels
2. **Cross-Platform**: Single codebase for iOS, Android, and Web
3. **Type Safety**: Full TypeScript implementation
4. **Security**: Multi-layer security approach
5. **Simple Architecture**: Functional approach without over-engineering
6. **Offline-When-Reasonable**: App functions preferably work without internet connection using SQLite cache

## 🏛️ Architecture Layers

### 1. Presentation Layer

```typescript
// app/(tabs)/home.tsx - Main screen component
export default function HomeScreen() {
  const { data: events, isLoading } = useEvents();
  const { data: announcements } = useAnnouncements();
  
  return (
    <ThemedView style={styles.container}>
      <EventList events={events} />
      <AnnouncementList announcements={announcements} />
    </ThemedView>
  );
}
```

**Responsibilities:**
- UI rendering and user interaction
- Navigation and routing (Expo Router)
- Form handling and validation
- Error display and user feedback

### 2. Business Logic Layer

```typescript
// hooks/useEvents/index.native.ts - Business logic for events
export default function useEvents(options?: {
  date?: string;
  showDeleted?: boolean;
}) {
  const cache = useCacheDatabase();
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
      if (error) throw new Error(error.message);
      return data as Event[];
    },
    refetchOnWindowFocus: false,
  });

  return { refetch, ...rest };
}
```

**Responsibilities:**
- Data transformation and business rules
- State management and caching
- API integration and error handling
- Real-time data synchronization

### 3. Data Access Layer

```typescript
// services/events.ts - Data access for events
export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    throw error;
  }

  return data;
}

export async function toggleRSVPStatus(
  eventId: number,
  attendeeId: number,
  status: boolean,
  deviceId?: string,
) {
  if (status) {
    const insertData: any = {
      event_id: eventId,
      attendee_id: attendeeId,
      rsvp_at: new Date().toISOString(),
      notified: false,
    };

    if (Platform.OS !== "web" && deviceId) {
      insertData.attendee_device_id = deviceId;
    } else {
      insertData.attendee_device_id = null;
    }

    const { error } = await supabase.from("event_attendees").insert(insertData);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("event_attendees")
      .delete()
      .eq("event_id", eventId)
      .eq("attendee_id", attendeeId);
    
    if (error) throw error;
  }
}
```

**Responsibilities:**
- Database operations via Supabase
- API calls and data fetching
- Local cache management
- Data validation and sanitization

### 4. Infrastructure Layer

```typescript
// constants/supabase.ts - Infrastructure configuration
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);
```

**Responsibilities:**
- External service integration (Supabase)
- Configuration management
- Security and authentication
- Monitoring and logging

## 🔄 Data Flow

### 1. Data Fetching Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Component │───►│ Custom Hook │───►│ Supabase    │───►│ PostgreSQL  │
│             │    │ (TanStack)  │    │ API         │    │ Database    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ▲                   │                   │                   │
       │                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   UI State  │◄───│   Cache     │◄───│   Response  │◄───│   Data      │
│             │    │ (Memory)    │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 2. Real-time Data Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Supabase    │───►│ WebSocket   │───►│ TanStack    │
│ Database    │    │ Channel     │    │ Query       │
│ Change      │    │             │    │ Invalidation│
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │ Real-time   │    │ UI Update   │
                   │ Subscription│    │             │
                   └─────────────┘    └─────────────┘
```

### 3. Offline Data Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Component │───►│ Custom Hook │───►│ SQLite      │
│             │    │ (TanStack)  │    │ Cache       │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                   │                   │
       │                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   UI State  │◄───│   Cache     │◄───│   Local     │
│             │    │ (Memory)    │    │   Data      │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🔒 Security Model

### Multi-Layer Security Approach

#### 1. Authentication Layer

```typescript
// Actual authentication implementation
export async function sendVerificationEmail(to: string, resend: boolean = false): Promise<boolean> {
  const code = await generate6DigitVerificationCode();

  if (!resend) {
    const { data: existingCode } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', to)
      .maybeSingle();

    if (existingCode) {
      resend = true;
    }
  }

  if (resend) {
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({
        created_at: new Date().toISOString(),
        code,
        has_been_used: false,
      })
      .eq('email', to);

    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        created_at: new Date().toISOString(),
        email: to,
        code,
        has_been_used: false,
      });

    if (insertError) throw insertError;
  }

  try {
    const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
      body: { email: to, code }
    });

    if (emailError) {
      throw new Error('Failed to send verification email');
    }
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }

  return true;
}
```

#### 2. Authorization Layer

```typescript
// Row Level Security (RLS) policies in Supabase
CREATE POLICY "Users can view their own data" ON attendees
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all events" ON events
  FOR ALL USING (auth.role() = 'admin');
```

#### 3. Data Protection Layer

```typescript
// Input validation and sanitization
export async function validateCredentials(credentials: AuthCredentials) {
  if (!credentials.email || !credentials.password) {
    throw new Error('Email and password are required');
  }
  
  if (!isValidEmail(credentials.email)) {
    throw new Error('Invalid email format');
  }
  
  if (credentials.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
}
```

### Security Features

1. **JWT Token Management**: Automatic token refresh and secure storage
2. **Input Validation**: Client and server-side validation
3. **SQL Injection Prevention**: Parameterized queries via Supabase
4. **Rate Limiting**: Supabase built-in rate limiting
5. **HTTPS Enforcement**: All communications encrypted

## ⚡ Performance Considerations

### 1. Caching Strategy

```typescript
// Multi-level caching approach
const cacheStrategy = {
  // Level 1: Memory cache (TanStack Query)
  memory: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  },
  
  // Level 2: Local storage (SQLite)
  local: {
    events: 30 * 60 * 1000, // 30 minutes
    contacts: 60 * 60 * 1000, // 1 hour
    announcements: 15 * 60 * 1000, // 15 minutes
  },
  
  // Level 3: Server cache (Supabase)
  server: {
    queryCache: true,
    realtimeCache: true,
  }
};
```

### 2. Data Optimization

```typescript
// Platform-specific data fetching
export default function useEvents(options?: {
  date?: string;
  showDeleted?: boolean;
}) {
  const cache = useCacheDatabase();
  
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

### 3. Bundle Optimization

```typescript
// Platform-specific imports
import { Platform } from "react-native";

// Conditional imports based on platform
const MapViewer = Platform.select({
  ios: () => require('./MapViewer/IOSMapViewer').default,
  android: () => require('./MapViewer/AndroidMapViewer').default,
  web: () => require('./MapViewer/WebMapViewer').default,
})();
```

## 🎯 Technical Decisions

### 1. Technology Stack Choices

| Component            | Technology          | Rationale                               |
|----------------------|---------------------|-----------------------------------------|
| **Frontend**         | React Native + Expo | Cross-platform, rapid development       |
| **Backend**          | Supabase            | BaaS with real-time, auth, and database |
| **Database**         | PostgreSQL          | ACID compliance, JSON support           |
| **State Management** | TanStack Query      | Data fetching and caching               |
| **Local Storage**    | SQLite + Drizzle    | Offline functionality, type safety      |
| **Authentication**   | Supabase Auth       | Built-in security, OAuth support        |

### 2. Architecture Patterns

#### Platform-Specific Implementation Pattern

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

#### Service Layer Pattern

```typescript
// services/events.ts
export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    throw error;
  }

  return data;
}

export async function toggleRSVPStatus(
  eventId: number,
  attendeeId: number,
  status: boolean,
  deviceId?: string,
) {
  // Direct Supabase calls for mutations
  if (status) {
    const { error } = await supabase.from("event_attendees").insert(insertData);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("event_attendees")
      .delete()
      .eq("event_id", eventId)
      .eq("attendee_id", attendeeId);
    
    if (error) throw error;
  }
}
```

### 3. Error Handling Strategy

```typescript
// Simple error handling pattern
export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    throw error;
  }

  return data;
}

// Error handling in components
const { data: events, isLoading, error } = useEvents();

if (error) {
  return (
    <View style={styles.errorContainer}>
      <Text>Failed to load events. Please try again.</Text>
    </View>
  );
}
```

## 🚀 Deployment Architecture

### 1. Development Environment

```json
// app.json - Expo configuration
{
  "expo": {
    "name": "SORM Symposium",
    "slug": "conference-app",
    "version": "1.0.0",
    "orientation": "default",
    "icon": "./assets/images/favicon.png",
    "scheme": "sormsymposium",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.sormconferenceapp.conferenceapp"
    },
    "android": {
      "package": "com.sormconferenceapp.conferenceapp",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/favicon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-splash-screen",
      "expo-sqlite",
      "expo-web-browser"
    ]
  }
}
```

### 2. Production Environment

```json
// eas.json - EAS Build configuration
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 3. Build and Deployment

```bash
# Development
npm start

# Production build
eas build --platform all

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## 🔗 Related Documentation

- [API Documentation](../api/README.md) - Backend integration details
- [Database Schema](../database/README.md) - Data structure design
- [State Management](../state-management/README.md) - Client-side state patterns
- [Authentication Guide](../auth/README.md) - Security implementation
- [Component Library](../components/README.md) - UI architecture patterns
