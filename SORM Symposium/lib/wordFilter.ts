/**
 * Word filter utility using the leo-profanity library for robust profanity detection in React Native / Expo environment
 */

import leoProfanity from 'leo-profanity';

// Load the default English dictionary once when this module is imported
leoProfanity.loadDictionary();

/**
 * Check if text contains any inappropriate content
 * @param text - The text to check
 * @returns Object with isFiltered boolean and matchedWords array
 */
export function checkForInappropriateContent(text: string): { isFiltered: boolean; matchedWords: string[] } {
  if (!text || typeof text !== 'string') {
    return { isFiltered: false, matchedWords: [] };
  }

  // Check if the text contains profanity using leo-profanity
  const isFiltered = leoProfanity.check(text);

  if (!isFiltered) {
    return { isFiltered: false, matchedWords: [] };
  }

  // Determine which profane words were detected by comparing against the dictionary
  const matchedWords: string[] = [];
  const lowercaseText = text.toLowerCase();

  // leoProfanity.list() returns the current dictionary of profane words
  for (const profaneWord of leoProfanity.list()) {
    if (lowercaseText.includes(profaneWord) && !matchedWords.includes(profaneWord)) {
      matchedWords.push(profaneWord);
    }
  }

  return {
    isFiltered: true,
    matchedWords,
  };
}

/**
 * Check multiple fields for inappropriate content
 * @param fields - Object with field names as keys and text values
 * @returns Object with isFiltered boolean and fieldsWithIssues array
 */
export function checkMultipleFields(fields: Record<string, string>): { 
  isFiltered: boolean; 
  fieldsWithIssues: string[] 
} {
  const fieldsWithIssues: string[] = [];

  for (const [fieldName, text] of Object.entries(fields)) {
    if (text) {
      const result = checkForInappropriateContent(text);
      if (result.isFiltered) {
        fieldsWithIssues.push(fieldName);
      }
    }
  }

  return {
    isFiltered: fieldsWithIssues.length > 0,
    fieldsWithIssues
  };
} 