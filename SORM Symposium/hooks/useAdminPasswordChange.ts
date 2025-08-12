import { supabase } from '@/constants/supabase';
import { useState, useCallback } from 'react';

interface UseAdminPasswordChangeReturn {
  isVisible: boolean;
  isChangingPassword: boolean;
  error: string;
  showModal: () => void;
  hideModal: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

/**
 * Custom hook for managing the admin password change modal
 * @returns Object containing modal state and control functions
 */
export function useAdminPasswordChange(): UseAdminPasswordChangeReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState('');

  /**
   * Show the password change modal
   */
  const showModal = useCallback(() => {
    setIsVisible(true);
    setError('');
  }, []);

  /**
   * Hide the password change modal and reset state
   */
  const hideModal = useCallback(() => {
    setIsVisible(false);
    setError('');
    setIsChangingPassword(false);
  }, []);

  /**
   * Change the user's password using Supabase Auth
   * @param oldPassword - The current password (for verification)
   * @param newPassword - The new password to set
   */
  const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<void> => {
    setIsChangingPassword(true);
    setError('');

    try {
      // First, verify the old password by attempting to sign in with it
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) {
        throw new Error('No authenticated user found');
      }

      // Verify old password by attempting sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.user.email,
        password: oldPassword,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Current password is incorrect');
        }
        throw signInError;
      }

      // Update the password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      // Success - hide modal
      hideModal();
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = (error as Error).message;
      
      // Provide user-friendly error messages
      if (errorMessage.includes('Invalid login credentials')) {
        setError('Current password is incorrect. Please try again.');
      } else if (errorMessage.includes('Password should be')) {
        setError('Password does not meet third-party requirements. Please try a different password.');
      } else if (errorMessage.includes('same as the old password')) {
        setError('New password must be different from your current password.');
      } else {
        setError(`Failed to change password: ${errorMessage}`);
      }
      throw error; // Re-throw so caller knows it failed
    } finally {
      setIsChangingPassword(false);
    }
  }, [hideModal]);

  return {
    isVisible,
    isChangingPassword,
    error,
    showModal,
    hideModal,
    changePassword,
  };
}

/**
 * Check if the provided password matches the default admin password
 * @param password - The password to check
 * @returns Promise that resolves to true if it matches the default password
 */
export async function isDefaultPassword(password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('check-default-password', {
      body: { password }
    });

    if (error) {
      console.error('Error checking default password:', error);
      return false;
    }

    return data?.isDefaultPassword || false;
  } catch (error) {
    console.error('Error calling check-default-password function:', error);
    return false;
  }
}

/**
 * Check if the current user is using the default password
 * This is called after successful authentication to determine if modal should show
 * @param email - The admin's email
 * @param password - The password they just used to log in
 * @returns Promise that resolves to true if they're using the default password
 */
export async function shouldShowPasswordChangeModal(email: string, password: string): Promise<boolean> {
  return await isDefaultPassword(password);
}
