import {
    getAttendeeByEmail,
    shouldShowContactSharingPopup,
    updateContactSharingPreferences,
    type Attendee
} from '@/services/attendees';
import { useCallback, useState } from 'react';

interface UseContactSharingModalReturn {
  isVisible: boolean;
  attendee: Attendee | null;
  showModal: (email: string) => Promise<boolean>;
  showModalForce: (email: string) => Promise<void>;
  hideModal: () => void;
  savePreferences: (shareInfo: boolean, additionalInfo: string) => Promise<void>;
}

/**
 * Custom hook for managing the contact sharing modal
 * @returns Object containing modal state and control functions
 */
export function useContactSharingModal(): UseContactSharingModalReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [attendee, setAttendee] = useState<Attendee | null>(null);

  /**
   * Check if modal should be shown for the given email and show it if needed
   * @param email - The attendee's email
   * @returns True if modal was shown, false otherwise
   */
  const showModal = useCallback(async (email: string): Promise<boolean> => {
    try {
      const shouldShow = await shouldShowContactSharingPopup(email);
      
      if (shouldShow) {
        const attendeeData = await getAttendeeByEmail(email);
        setAttendee(attendeeData);
        setIsVisible(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking if contact sharing modal should be shown:', error);
      return false;
    }
  }, []);

  /**
   * Force show the modal for the given email (even if they've seen it before)
   * Useful for settings or manual triggers
   * @param email - The attendee's email
   */
  const showModalForce = useCallback(async (email: string): Promise<void> => {
    try {
      const attendeeData = await getAttendeeByEmail(email);
      if (attendeeData) {
        setAttendee(attendeeData);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error forcing contact sharing modal to show:', error);
      throw error;
    }
  }, []);

  /**
   * Hide the modal and reset state
   */
  const hideModal = useCallback(() => {
    setIsVisible(false);
    setAttendee(null);
  }, []);

  /**
   * Save the attendee's contact sharing preferences
   * @param shareInfo - Whether they want to share their info
   * @param additionalInfo - Additional information they want to share
   */
  const savePreferences = useCallback(async (shareInfo: boolean, additionalInfo: string) => {
    if (!attendee?.email) {
      throw new Error('No attendee email available');
    }

    try {
      await updateContactSharingPreferences(attendee.email, shareInfo, additionalInfo);
    } catch (error) {
      console.error('Error saving contact sharing preferences:', error);
      throw error;
    }
  }, [attendee]);

  return {
    isVisible,
    attendee,
    showModal,
    showModalForce,
    hideModal,
    savePreferences,
  };
}

/**
 * Convenience function to show the contact sharing modal for any email
 * This can be used by other team members working on different features
 * @param email - The attendee's email
 * @returns Promise that resolves when the modal operations are complete
 */
export async function triggerContactSharingModal(email: string): Promise<void> {
  try {
    const attendeeData = await getAttendeeByEmail(email);
    if (!attendeeData) {
      throw new Error('Attendee not found');
    }
    
    // This would need to be integrated with a global modal system
    // For now, this is just a helper that other developers can use
    console.log('Contact sharing modal should be triggered for:', email);
    
    // The actual implementation would depend on how the other team member
    // wants to integrate this into their feature
  } catch (error) {
    console.error('Error triggering contact sharing modal:', error);
    throw error;
  }
} 