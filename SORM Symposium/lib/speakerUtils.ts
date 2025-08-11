/**
 * Utility functions for handling speaker data as native arrays
 * (Supabase varchar[] columns)
 */

/**
 * Converts a semicolon-separated string to an array of speaker names
 */
export function parseSpeakerString(speakerString: string | null): string[] | null {
  if (!speakerString || speakerString.trim() === '') {
    return null;
  }
  return speakerString.split(';').map(name => name.trim()).filter(name => name.length > 0);
}

/**
 * Converts an array of speaker names to a semicolon-separated string for display
 */
export function formatSpeakersForDisplay(speakers: string[] | null): string {
  if (!speakers || speakers.length === 0) {
    return '';
  }
  return speakers.join('; ');
}

/**
 * Gets the first speaker name from an array, or empty string if none
 */
export function getFirstSpeakerName(speakers: string[] | null): string {
  if (!speakers || speakers.length === 0) {
    return '';
  }
  return speakers[0];
}

/**
 * Gets the first speaker title from an array, or empty string if none
 */
export function getFirstSpeakerTitle(titles: string[] | null): string {
  if (!titles || titles.length === 0) {
    return '';
  }
  return titles[0];
}

/**
 * Gets the first speaker bio from an array, or empty string if none
 */
export function getFirstSpeakerBio(bios: string[] | null): string {
  if (!bios || bios.length === 0) {
    return '';
  }
  return bios[0];
}

/**
 * Gets the first speaker company from an array, or empty string if none
 */
export function getFirstSpeakerCompany(companies: string[] | null): string {
  if (!companies || companies.length === 0) {
    return '';
  }
  return companies[0];
}

/**
 * Validates that all speaker arrays have the same length
 */
export function validateSpeakerArrays(
  names: string[] | null,
  titles: string[] | null,
  bios: string[] | null,
  companies: string[] | null
): boolean {
  const nameCount = names?.length || 0;
  const titleCount = titles?.length || 0;
  const bioCount = bios?.length || 0;
  const companyCount = companies?.length || 0;
  
  // All arrays should have the same length, or be empty/null
  const maxCount = Math.max(nameCount, titleCount, bioCount, companyCount);
  if (maxCount === 0) return true; // All empty is valid
  
  return (names?.length || 0) === maxCount &&
         (titles?.length || 0) === maxCount &&
         (bios?.length || 0) === maxCount &&
         (companies?.length || 0) === maxCount;
} 