/**
 * Formats a time string from 24-hour format (HH:mm:ss) to 12-hour format (h:mm A)
 * @param time Time string in HH:mm:ss or HH:mm format
 * @returns Formatted time string in h:mm A format (e.g., "8:00 AM")
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  const displayMinutes = minutes.toString().padStart(2, '0');
  
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Formats a date string to a long format (e.g., "Monday, August 20, 2025")
 * @param dateStr Date string in YYYY-MM-DD format
 * @returns Formatted date string
 */
export function formatDate(dateStr: string): string {
  // Append 'T12:00:00' to ensure the date is interpreted at noon UTC
  // This prevents timezone issues from changing the date
  const date = new Date(dateStr + 'T12:00:00Z');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC' // Ensure we use UTC to avoid timezone shifts
  });
}

/**
 * Formats a time range into a readable string
 * @param startTime Start time in HH:mm:ss format
 * @param endTime End time in HH:mm:ss format
 * @returns Formatted time range (e.g., "8:00 AM - 9:00 AM")
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
} 