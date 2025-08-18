# Authentication Guide

This document provides a comprehensive overview of the authentication system in the SORM Symposium mobile application, including both attendee and organizer authentication flows.

## 📋 Table of Contents

- [Authentication Overview](#authentication-overview)
- [Attendee Authentication](#attendee-authentication)
- [Organizer Authentication](#organizer-authentication)
- [Security Features](#security-features)
- [Implementation Details](#implementation-details)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## 🔐 Authentication Overview

The SORM Symposium app implements a dual authentication system:

- **Attendee Authentication**: OTP-based verification with email/phone
- **Organizer Authentication**: Traditional email/password with admin privileges

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Attendee      │    │   Organizer     │    │   Supabase      │
│   Login Flow    │    │   Login Flow    │    │   Auth Service  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Email/Phone    │    │ Email/Password  │    │  JWT Tokens     │
│ OTP Verification│    │  Authentication │    │  & Sessions     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 👥 Attendee Authentication

### Flow Overview

1. **Registration Email Entry** - Attendee enters their symposium registration email
2. **Contact Method Selection** - Choose between SMS or email verification
3. **OTP Request** - System sends verification code
4. **OTP Verification** - Attendee enters the code
5. **Authentication Complete** - Attendee gains access to app features

### Step-by-Step Process

#### 1. Registration Email Collection

```typescript
// User enters their symposium registration email
const attendeeEmail = "attendee@example.com";

// System validates the email is registered
const isRegistered = await isAttendeeEmail(attendeeEmail);
if (!isRegistered) {
  throw new Error("Email not found in symposium registration.");
}
```

#### 2. Contact Method Selection

```typescript
// User chooses verification method
const verificationMethod = "phone"; // or "email"
const contactInfo = "+1234567890"; // or email address

// System validates contact information
const isValidContact = await validateContact(contactInfo, verificationMethod);
```

#### 3. OTP Request

```typescript
import { requestOTP } from '@/api/signinUser';

try {
  const result = await requestOTP(
    contactInfo,        // Phone or email
    attendeeEmail,      // Registration email
    false               // Don't bypass admin check
  );
  
  if (result.success) {
    // Show OTP input screen
    setShowOTPInput(true);
  }
} catch (error) {
  console.error('OTP request failed:', error.message);
}
```

#### 4. OTP Verification

```typescript
import { verifyOTP } from '@/api/signinUser';

try {
  const result = await verifyOTP(
    contactInfo,        // Phone or email used for OTP
    otpCode,           // 6-digit code entered by user
    attendeeEmail      // Registration email for identification
  );
  
  if (result.success && result.attendee) {
    // Store attendee data and complete authentication
    await storeAttendeeData(result.attendee);
    setAuthenticated(true);
  }
} catch (error) {
  console.error('OTP verification failed:', error.message);
}
```

### Attendee Data Structure

```typescript
interface Attendee {
  id: number;
  created_at: string;
  email: string | null;
  phone?: string | null;
  name: string | null;
  organization: string | null;
  title: string | null;
  additional_info: string | null;
  is_admin: boolean;
  share_info?: boolean;
  seen_share_info_popup?: boolean;
}
```

## 👨‍💼 Organizer Authentication

### Flow Overview

1. **Email/Password Entry** - Organizer enters credentials
2. **Admin Validation** - System checks if email is registered as admin
3. **Password Authentication** - Supabase handles password verification
4. **Default Password Check** - System detects if using default password
5. **Authentication Complete** - Organizer gains admin access

### Step-by-Step Process

#### 1. Credential Entry

```typescript
const adminEmail = "admin@example.com";
const adminPassword = "securePassword123";
```

#### 2. Admin Validation

```typescript
import signinAdmin from '@/api/signinUser';

try {
  const result = await signinAdmin(
    adminEmail,
    adminPassword,
    () => console.log('Login successful!')
  );
  
  if (result.isUsingDefaultPassword) {
    // Prompt for password change
    setShowPasswordChangeModal(true);
  }
} catch (error) {
  console.error('Admin login failed:', error.message);
}
```

## 🔒 Security Features

### Password Security

#### Default Password Detection

```typescript
// Edge function to check default password
async function checkIsDefaultPassword(password: string): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('check-default-password', {
    body: { password }
  });
  
  return data?.isDefaultPassword || false;
}
```

#### Password Validation

```typescript
// Password strength requirements
const passwordRequirements = {
  minLength: 10,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};
```

### OTP Security

#### Rate Limiting

The application uses Supabase's built-in rate limiting configured in `supabase/config.toml`:

```toml
[auth.rate_limit]
# Number of emails that can be sent per hour
email_sent = 2
# Number of SMS messages that can be sent per hour  
sms_sent = 30
# Number of OTP verifications per 5 minutes per IP
token_verifications = 30
```

#### OTP Expiration

OTP expiration is configured at multiple levels:

**Supabase Configuration** (`supabase/config.toml`):
```toml
# Email OTP expiration (1 hour)
otp_expiry = 3600
```

**Application-level Verification** (`hooks/use6DigitVerification.ts`):
```typescript
// 10-minute expiration check for verification codes
if (data && data.created_at > new Date(Date.now() - 10 * 60 * 1000).toISOString()) {
  // Code is valid and not expired
  return true;
}
```

### Session Management

#### JWT Token Handling

```typescript
// Token refresh logic
const refreshToken = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  
  if (error) {
    // Handle refresh error
    await signOut();
  } else {
    // Update session
    setSession(data.session);
  }
};
```

#### Session Persistence

```typescript
// Session storage configuration
const sessionConfig = {
  storage: AsyncStorage,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false
};
```

## 🛠️ Implementation Details

### Authentication Providers

#### Supabase Auth Configuration

```typescript
// constants/supabase.ts
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);
```

#### Authentication Hooks

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

### Contact Verification

#### Phone Number Validation

```typescript
import { parsePhoneNumber } from 'libphonenumber-js';

const validatePhoneNumber = (phoneNumber: string): boolean => {
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    return parsed.isValid();
  } catch {
    return false;
  }
};
```

#### Email Validation

```typescript
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

## ⚠️ Error Handling

### Common Error Scenarios

#### Attendee Authentication Errors

```typescript
// Email not registered
if (!isRegistered) {
  throw new Error("This email is not registered. Please try a different email or contact a Symposium Organizer for a paper copy of the schedule.");
}

// Invalid contact information
if (!isValidContact) {
  throw new Error("Please enter a valid phone number or email address.");
}

// OTP verification failed
if (!otpValid) {
  throw new Error("Invalid verification code. Please try again.");
}
```

#### Organizer Authentication Errors

```typescript
// Email not registered as admin
if (!isAdmin) {
  throw new Error("This email is registered as an attendee. Please go back and use the 'Symposium Attendee' option instead.");
}

// Invalid credentials
if (invalidCredentials) {
  throw new Error("Incorrect password. Please check your password and try again.");
}
```

### Error Recovery

#### Retry Logic

```typescript
const retryAuthentication = async (attempts: number = 3) => {
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await authenticateUser(credentials);
      return result;
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

#### Fallback Options

```typescript
// Provide alternative authentication methods
const handleAuthenticationFailure = (error: Error) => {
  if (error.message.includes('network')) {
    // Suggest offline mode
    showOfflineModeOption();
  } else if (error.message.includes('contact')) {
    // Suggest alternative contact method
    showAlternativeContactOptions();
  }
};
```

## 📱 UI Components

### Authentication Modals

#### 6-Digit Verification Modal

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

#### Admin Password Change Modal

```typescript
import { AdminPasswordChangeModal } from '@/components/AdminPasswordChangeModal';

<AdminPasswordChangeModal
  visible={showPasswordChange}
  onPasswordChange={handlePasswordChange}
  onCancel={() => setShowPasswordChange(false)}
  isLoading={isChangingPassword}
/>
```

### Form Validation

#### Real-time Validation

```typescript
const validateForm = (values: FormValues) => {
  const errors: FormErrors = {};
  
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(values.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (values.phone && !validatePhoneNumber(values.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  return errors;
};
```

## 🔧 Best Practices

### Security Best Practices

1. **Never store passwords** in plain text
2. **Use HTTPS** for all authentication requests
3. **Implement rate limiting** for OTP requests
4. **Validate all inputs** on both client and server
5. **Use secure session management**
6. **Implement proper error handling** without exposing sensitive information

### User Experience Best Practices

1. **Provide clear error messages** that guide users
2. **Offer multiple authentication methods** for flexibility
3. **Implement progressive disclosure** for complex flows
4. **Use loading states** to indicate progress
5. **Provide offline alternatives** when possible
6. **Remember user preferences** for contact methods

### Code Organization Best Practices

1. **Separate concerns** between UI and business logic
2. **Use TypeScript** for type safety
3. **Implement proper error boundaries**
4. **Test authentication flows** thoroughly
5. **Document authentication requirements**
6. **Use consistent naming conventions**

## 🔗 Related Documentation

- [API Documentation](../api/README.md) - Authentication API endpoints
- [Component Library](../components/README.md) - Auth UI components
- [Database Schema](../database/README.md) - User data storage
- [System Architecture](../architecture/README.md) - Security implementation
