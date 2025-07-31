import { useState, useCallback } from 'react';
import { sendVerificationEmail } from './use6DigitVerification';

export function use6DigitVerificationModal() {
  const [visible, setVisible] = useState(false);

  const showModal = useCallback(async (emailToVerify: string) => {
    setVisible(true);
    await sendVerificationEmail(emailToVerify.toLowerCase());
  }, []);

  const hideModal = useCallback(() => {
    setVisible(false);
  }, []);

  const resendVerificationEmail = useCallback(async (emailToVerify: string) => {
    await sendVerificationEmail(emailToVerify.toLowerCase(), true);
  }, []);

  return {
    visible,
    showModal,
    hideModal,
    resendVerificationEmail,
  };
} 