/**
 * Migration script to convert existing single-speaker data to multiple speakers format
 * 
 * This script converts existing single speaker_name, speaker_title, speaker_bio, and speaker_company
 * values to arrays for the new multiple speakers feature.
 * 
 * Run this script after updating the database schema to use varchar[] columns.
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateSpeakersToArrays() {
  console.log('Starting migration of speakers to arrays...');
  
  try {
    // Fetch all events
    const { data: events, error } = await supabase
      .from('events')
      .select('id, speaker_name, speaker_title, speaker_bio, speaker_company');
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${events.length} events to process`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const event of events) {
      // Check if speaker fields are already arrays
      const isAlreadyArray = Array.isArray(event.speaker_name) || 
                           Array.isArray(event.speaker_title) || 
                           Array.isArray(event.speaker_bio) ||
                           Array.isArray(event.speaker_company);
      
      if (isAlreadyArray) {
        console.log(`Event ${event.id}: Already has array format, skipping`);
        skippedCount++;
        continue;
      }
      
      // Convert single values to arrays
      const speakerNameArray = event.speaker_name ? [event.speaker_name] : null;
      const speakerTitleArray = event.speaker_title ? [event.speaker_title] : null;
      const speakerBioArray = event.speaker_bio ? [event.speaker_bio] : null;
      const speakerCompanyArray = event.speaker_company ? [event.speaker_company] : null;
      
      // Update the event
      const { error: updateError } = await supabase
        .from('events')
        .update({
          speaker_name: speakerNameArray,
          speaker_title: speakerTitleArray,
          speaker_bio: speakerBioArray,
          speaker_company: speakerCompanyArray
        })
        .eq('id', event.id);
      
      if (updateError) {
        console.error(`Error updating event ${event.id}:`, updateError);
        continue;
      }
      
      console.log(`Event ${event.id}: Migrated to array format`);
      migratedCount++;
    }
    
    console.log('\nMigration completed!');
    console.log(`Events migrated: ${migratedCount}`);
    console.log(`Events skipped (already arrays): ${skippedCount}`);
    console.log(`Total events processed: ${events.length}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateSpeakersToArrays(); 