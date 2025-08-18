# SORM Symposium Mobile App

A React Native/Expo mobile application for managing and attending the SORM Symposium conference. This app provides attendees with real-time access to event schedules, networking features, announcements, and interactive maps, while giving organizers administrative tools for event management.

## 🚀 Features

### For Attendees
- **Event Management**: View and RSVP to symposium events
- **Real-time Schedule**: Live agenda updates and notifications
- **Networking**: Connect with other attendees and share contact information
- **Interactive Maps**: Navigate the venue with detailed floor plans
- **Push Notifications**: Stay updated with important announcements
- **Contact Sharing**: Exchange contact details with other attendees

### For Organizers
- **Admin Dashboard**: Manage events, announcements, and attendee data
- **Real-time Updates**: Push announcements and schedule changes
- **Attendee Management**: View and manage attendee information
- **Event Creation**: Add and modify symposium events

## 🏗️ Architecture

- **Frontend**: React Native with Expo Router
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **Authentication**: Supabase Auth with custom attendee verification
- **Database**: Drizzle ORM with SQLite for offline caching
- **State Management**: TanStack Query for server state
- **Push Notifications**: Expo Notifications with Supabase Edge Functions

## 📱 Tech Stack

- **Framework**: Expo SDK 53 with React Native 0.79.5
- **Navigation**: Expo Router (file-based routing)
- **Database**: Supabase + Drizzle ORM
- **State Management**: TanStack Query
- **UI Components**: Custom themed components
- **Maps**: Platform-specific map implementations
- **Notifications**: Expo Notifications
- **TypeScript**: Full type safety throughout

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd conference-app/SORM\ Symposium
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your preferred platform**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web Browser
   npm run web
   ```

## 🔐 Authentication Flow

### Attendee Authentication
1. **Email Registration**: Enter the email used for symposium registration
2. **OTP Verification**: Choose between SMS or email verification
3. **Contact Verification**: Verify phone number or email address

### Organizer Authentication
- Traditional email/password login with admin credentials
- Default password detection and change prompts

## 📁 Project Structure

```
SORM Symposium/
├── app/                    # Expo Router pages
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── services/              # Business logic and API calls
├── constants/             # App constants and configuration
├── types/                 # TypeScript type definitions
├── db/                    # Database schema and migrations
├── supabase/              # Supabase configuration and functions
└── docs/                  # Project documentation
```

## 📚 Documentation

- **[API Documentation](./docs/api/README.md)** - Complete API reference
- **[Component Library](./docs/components/README.md)** - UI component documentation
- **[Database Schema](./docs/database/README.md)** - Database structure and relationships
- **[Authentication Guide](./docs/auth/README.md)** - Detailed auth flow documentation
- **[State Management](./docs/state-management/README.md)** - TanStack Query and local state patterns
- **[System Architecture](./docs/architecture/README.md)** - System design and technical decisions
- **[Changelog](./docs/CHANGELOG.md)** - Version history and release notes

## 🚀 Development

### Available Scripts
- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Custom themed components for consistent UI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](./docs/)
- Review [existing issues](https://github.com/your-repo/issues)
- Create a new issue with detailed information

## 🔄 Version History

See [CHANGELOG.md](./docs/CHANGELOG.md) for a complete version history and recent changes.
