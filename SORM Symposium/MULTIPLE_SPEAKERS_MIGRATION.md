# Multiple Speakers Migration Guide

This document outlines the changes needed to support multiple speakers per event in the SORM Symposium app.

## Overview

The events table will be updated to support multiple speakers by changing the `speaker_name`, `speaker_title`, `speaker_bio`, and `speaker_company` fields from single strings to arrays of strings (`varchar[]` in Supabase).

## Database Schema Changes

### Supabase Database
The following columns in the `events` table will be changed from `varchar` to `varchar[]`:
- `speaker_name`
- `speaker_title` 
- `speaker_bio`
- `speaker_company`

### Local SQLite Schema (Drizzle)
The local schema in `db/schema.ts` has been updated with comments indicating these fields will store arrays.

## Type Definitions

### Supabase Types (`types/Supabase.types.ts`)
The TypeScript types for the events table have been updated:
```typescript
// In Row, Insert, and Update types for 'events' table
speaker_name: string[] | null
speaker_title: string[] | null
speaker_bio: string[] | null
speaker_company: string[] | null
```

### Event Types (`types/Events.types.ts`)
The local Event type has been updated to match:
```typescript
export interface Event {
  // ... other fields
  speaker_name: string[] | null;
  speaker_title: string[] | null;
  speaker_bio: string[] | null;
  speaker_company: string[] | null;
  // ... other fields
}
```

## Utility Functions

A new utility file `lib/speakerUtils.ts` has been created with functions for handling speaker arrays:

- `parseSpeakerString(speakerString: string | null): string[] | null` - Converts semicolon-separated strings to arrays
- `formatSpeakersForDisplay(speakers: string[] | null): string` - Converts arrays to display strings
- `getFirstSpeakerName/title/bio/company()` - Helper functions for backward compatibility
- `validateSpeakerArrays()` - Validates that all speaker arrays have matching lengths

## UI Component Updates

### EventForm (`components/AgendaViewer/EventForm.tsx`)
- Updated to handle speaker data as native arrays
- Input fields accept semicolon-separated strings and convert to arrays
- Form submission sends arrays directly to the database
- Added fields for speaker bios and companies

### Event Detail Page (`app/event/[id].tsx`)
- Updated to display multiple speakers from arrays
- Shows speaker names, titles, companies, and bios in a structured format
- Added styling for company information

### AgendaEditor (`components/AgendaViewer/AgendaEditor.tsx`)
- Updated to handle speaker arrays in event creation and updates
- Removed JSON conversion utilities

## Migration Script

A migration script `scripts/migrate-speakers-to-arrays.js` has been created to convert existing single-speaker data to the new array format.

### Running the Migration

1. **Update the database schema** in Supabase to use `varchar[]` columns
2. **Set environment variables**:
   ```bash
   export SUPABASE_URL="your-supabase-url"
   export SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```
3. **Run the migration script**:
   ```bash
   node scripts/migrate-speakers-to-arrays.js
   ```

The script will:
- Fetch all events from the database
- Check if speaker fields are already arrays
- Convert single string values to arrays
- Update the database with the new format
- Provide a summary of migrated and skipped events

## Backward Compatibility

The implementation maintains backward compatibility by:
- Using `getFirstSpeakerName/title/bio/company()` functions for components that expect single values
- Gracefully handling null/empty arrays
- Providing fallback display text when no speakers are available

## Testing

After migration, test the following scenarios:
1. Creating events with multiple speakers
2. Editing existing events with multiple speakers
3. Displaying events with multiple speakers on the detail page
4. Form validation for speaker data
5. Backward compatibility with existing single-speaker events

## Notes

- The UI uses semicolon-separated strings for input, which are converted to arrays for storage
- Empty arrays are stored as `null` in the database for consistency
- All speaker arrays (names, titles, bios, companies) should have the same length for a given event
- The migration script is idempotent and can be run multiple times safely 