# Changelog

All notable changes to the SORM Symposium mobile application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation structure
- API documentation with examples
- Component library documentation
- Database schema documentation
- Authentication flow documentation

### Changed
- Enhanced README with detailed project overview
- Improved project structure documentation

## [1.0.0] - 2024-01-15

### Added
- Initial release of SORM Symposium mobile application
- Dual authentication system (attendee and organizer)
- Event management with RSVP functionality
- Real-time announcements and notifications
- Interactive venue maps
- Networking features with contact sharing
- Admin dashboard for event management
- Push notification system
- Offline support with local caching
- Cross-platform support (iOS, Android, Web)

### Features
- **Authentication**
  - Attendee OTP-based authentication
  - Organizer email/password authentication
  - Default password detection and change prompts
  - Session management with JWT tokens

- **Event Management**
  - Create, edit, and delete events
  - Event scheduling with date/time management
  - Speaker information management
  - RSVP functionality for attendees
  - Event attendance tracking

- **Networking**
  - Contact information sharing
  - Attendee directory
  - Contact management system
  - QR code-based contact exchange

- **Maps and Navigation**
  - Interactive venue floor plans
  - Location-based services
  - Platform-specific map implementations
  - Offline map support

- **Notifications**
  - Push notifications for announcements
  - Event reminders and updates
  - Real-time notification delivery
  - Notification preferences management

- **Admin Features**
  - Event creation and management
  - Announcement broadcasting
  - Attendee data management
  - Analytics and reporting

### Technical Implementation
- **Frontend**: React Native with Expo SDK 53
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Database**: Drizzle ORM with SQLite for offline caching
- **State Management**: TanStack Query
- **Authentication**: Supabase Auth
- **Maps**: Platform-specific implementations
- **Notifications**: Expo Notifications
- **TypeScript**: Full type safety throughout

### Security Features
- Row Level Security (RLS) policies
- Input validation and sanitization
- Secure session management
- Rate limiting for OTP requests
- Password strength validation
- Data encryption at rest

---

## Version History Summary

| Version | Release Date | Key Features |
|---------|--------------|--------------|
| 1.0.0 | 2025-08-12 | Production release with full feature set |
| 0.1.0 | 2025-05--- | Project initialization and setup |

## Migration Guides

### Upgrading from 1.0.0 to ???


## Breaking Changes

### Version 1.0.0
- None (first production release)

## Known Issues

### Version 1.0.0
- Caching does not work on web due to SQLite file system usage
- Phone verification poses security issue (bad-actor could input their own number to verify when logging in to another attendee's account)
- When presentation slides are downloaded and opened, returning to the website displays "not found"

## Support

For questions about version changes or migration issues:

- Check the [documentation](../README.md)
- Review [existing issues](https://github.com/your-repo/issues)
- Create a new issue with detailed information
