# Component Library

This document provides a comprehensive reference for all UI components in the SORM Symposium mobile application.

## 📋 Table of Contents

- [Core Components](#core-components)
- [Form Components](#form-components)
- [Navigation Components](#navigation-components)
- [Feature Components](#feature-components)
- [Utility Components](#utility-components)
- [Theming System](#theming-system)

## 🧩 Core Components

### `ThemedView`

A themed container component that adapts to light/dark mode.

**Props:**
```typescript
interface ThemedViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  lightColor?: string;
  darkColor?: string;
}
```

**Example:**
```typescript
import { ThemedView } from '@/components/ThemedView';

<ThemedView style={styles.container}>
  <Text>Content goes here</Text>
</ThemedView>
```

### `ThemedText`

A themed text component with consistent styling.

**Props:**
```typescript
interface ThemedTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  lightColor?: string;
  darkColor?: string;
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
}
```

**Example:**
```typescript
import { ThemedText } from '@/components/ThemedText';

<ThemedText variant="title">Welcome to SORM Symposium</ThemedText>
<ThemedText variant="body">This is the main content area.</ThemedText>
```

### `ThemedTextInput`

A themed text input component with consistent styling.

**Props:**
```typescript
interface ThemedTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: StyleProp<TextStyle>;
  error?: string;
}
```

**Example:**
```typescript
import { ThemedTextInput } from '@/components/ThemedTextInput';

<ThemedTextInput
  value={email}
  onChangeText={setEmail}
  placeholder="Enter your email"
  keyboardType="email-address"
  autoCapitalize="none"
  error={emailError}
/>
```

## 📝 Form Components

### `AnnouncementForm`

Form component for creating and editing announcements.

**Props:**
```typescript
interface AnnouncementFormProps {
  initialData?: AnnouncementData;
  onSubmit: (data: AnnouncementData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Example:**
```typescript
import { AnnouncementForm } from '@/components/AnnouncementForm';

<AnnouncementForm
  initialData={existingAnnouncement}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isLoading={isSubmitting}
/>
```

### `EventForm`

Form component for creating and editing events.

**Props:**
```typescript
interface EventFormProps {
  initialData?: EventData;
  onSubmit: (data: EventData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Example:**
```typescript
import { EventForm } from '@/components/AgendaViewer/EventForm';

<EventForm
  initialData={existingEvent}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isLoading={isSubmitting}
/>
```

### `ContactEditForm`

Form component for editing contact information.

**Props:**
```typescript
interface ContactEditFormProps {
  contact: ContactData;
  onSave: (contact: ContactData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Example:**
```typescript
import { ContactEditForm } from '@/components/Networking/ContactEditForm';

<ContactEditForm
  contact={contactData}
  onSave={handleSave}
  onCancel={handleCancel}
  isLoading={isSaving}
/>
```

## 🧭 Navigation Components

### `HapticTab`

A tab component with haptic feedback for better user experience.

**Props:**
```typescript
interface HapticTabProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}
```

**Example:**
```typescript
import { HapticTab } from '@/components/HapticTab';

<HapticTab onPress={handlePress}>
  <Text>Tab Content</Text>
</HapticTab>
```

### `TabBarBackground`

Custom tab bar background component for iOS and Android.

**Platform-specific implementations:**
- `TabBarBackground.ios.tsx` - iOS-specific styling
- `TabBarBackground.tsx` - Android/Web styling

**Props:**
```typescript
interface TabBarBackgroundProps {
  style?: StyleProp<ViewStyle>;
}
```

## 🎯 Feature Components

### `AgendaViewer`

Complete agenda management system with editing capabilities.

**Components:**
- `AgendaEditor.tsx` - Main agenda editing interface
- `AgendaItem.tsx` - Individual event display
- `EventList.tsx` - List of all events (used for Attendee viewing)
- `SpecialEventGroup.tsx` - Grouped events with conflicting/overlapping times

**Example:**
```typescript
import { AgendaViewer } from '@/components/AgendaViewer';

<AgendaViewer
  events={events}
  onEventUpdate={handleEventUpdate}
  onEventDelete={handleEventDelete}
  isAdmin={isAdmin}
/>
```

### `MapViewer`

Interactive map component with platform-specific implementations.

**Components:**
- `index.tsx` - Main map component
- `WebMapViewer.tsx` - Web implementation
- `IOSMapViewer.tsx` - iOS implementation
- `AndroidMapViewer.tsx` - Android implementation
- `MobileMapViewer.tsx` - Mobile-specific features

**Example:**
```typescript
import { MapViewer } from '@/components/MapViewer';

<MapViewer
  venueImage={require('@/assets/images/Symposium-floor-plan-v3.jpeg')}
  onLocationPress={handleLocationPress}
  showUserLocation={true}
/>
```

### `Networking`

Contact management and sharing system.

**Components:**
- `AttendeeContactList.tsx` - List of attendee contacts
- `ContactSharingModal.tsx` - Modal for sharing contacts
- `ConfirmEditEmailModal.tsx` - Email editing confirmation
- `contactRow.tsx` - Individual contact row display

**Example:**
```typescript
import { AttendeeContactList } from '@/components/Networking/AttendeeContactList';

<AttendeeContactList
  contacts={contacts}
  onContactPress={handleContactPress}
  onShareContact={handleShareContact}
/>
```

## 🔧 Utility Components

### `ConfirmationModal`

Reusable confirmation dialog component.

**Props:**
```typescript
interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}
```

**Example:**
```typescript
import { ConfirmationModal } from '@/components/ConfirmationModal';

<ConfirmationModal
  visible={showDeleteModal}
  title="Delete Event"
  message="Are you sure you want to delete this event?"
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={handleDelete}
  onCancel={() => setShowDeleteModal(false)}
  type="danger"
/>
```

### `6DigitVerificationModal`

Modal for 6-digit OTP verification.

**Props:**
```typescript
interface VerificationModalProps {
  visible: boolean;
  onVerify: (code: string) => void;
  onCancel: () => void;
  onResend: () => void;
  isLoading?: boolean;
  contact: string;
}
```

**Example:**
```typescript
import { VerificationModal } from '@/components/6DigitVerificationModal';

<VerificationModal
  visible={showVerification}
  onVerify={handleVerify}
  onCancel={handleCancel}
  onResend={handleResend}
  isLoading={isVerifying}
  contact="+1234567890"
/>
```

### `AdminPasswordChangeModal`

Modal for admin password changes.

**Props:**
```typescript
interface PasswordChangeModalProps {
  visible: boolean;
  onPasswordChange: (newPassword: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Example:**
```typescript
import { AdminPasswordChangeModal } from '@/components/AdminPasswordChangeModal';

<AdminPasswordChangeModal
  visible={showPasswordChange}
  onPasswordChange={handlePasswordChange}
  onCancel={() => setShowPasswordChange(false)}
  isLoading={isChangingPassword}
/>
```

### `SormImageWrapper`

Optimized image component with error handling.

**Props:**
```typescript
interface SormImageWrapperProps {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  onError?: () => void;
}
```

**Example:**
```typescript
import { SormImageWrapper } from '@/components/SormImageWrapper';

<SormImageWrapper
  source={require('@/assets/images/sorm-logo.png')}
  style={styles.logo}
  resizeMode="contain"
  onError={handleImageError}
/>
```

## 🎨 Theming System

### Color System

Colors are defined in `constants/Colors.ts`:

Non-exhaustive example:
```typescript
export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: '#2f95dc',
    tabIconDefault: '#ccc',
    tabIconSelected: '#2f95dc',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: '#fff',
    tabIconDefault: '#ccc',
    tabIconSelected: '#fff',
  },
};
```

### Icon System

Platform-specific icon components:

- `IconSymbol.ios.tsx` - iOS-specific icons
- `IconSymbol.tsx` - Android/Web icons

**Usage:**
```typescript
import { IconSymbol } from '@/components/ui/IconSymbol';

<IconSymbol name="calendar" size={24} color={Colors.light.text} />
```

## 📱 Responsive Design

### Platform Adaptations

Components automatically adapt to different platforms:

```typescript
// Platform-specific styling
const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});
```

### Screen Size Considerations

```typescript
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const isTablet = width > 768;
const isSmallScreen = height < 700;
```

## 🔧 Best Practices

### 1. Component Composition

Prefer composition over inheritance:

```typescript
// Good: Composition
<ThemedView style={styles.container}>
  <ThemedText variant="title">Title</ThemedText>
  <ThemedText variant="body">Content</ThemedText>
</ThemedView>

// Avoid: Complex inheritance
```

### 2. Props Interface

Always define clear prop interfaces:

```typescript
interface MyComponentProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}
```

### 3. Performance Optimization

Use React.memo for expensive components:

```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});
```

## 🔗 Related Documentation

- [API Documentation](../api/README.md) - Backend integration
- [State Management](../state-management/README.md) - Data flow patterns
- [Authentication Guide](../auth/README.md) - Auth components
