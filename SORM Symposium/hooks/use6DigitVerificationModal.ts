import { useState, useCallback, useRef } from 'react';
import { sendVerificationEmail } from './use6DigitVerification';

export function use6DigitVerificationModal() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const showModal = useCallback(async (emailToVerify: string) => {
    setEmail(emailToVerify);
    setVisible(true);
    await sendVerificationEmail(emailToVerify);
  }, []);

  const hideModal = useCallback(() => {
    setVisible(false);
    setEmail(null);
  }, []);

  const resendVerificationEmail = useCallback(async (emailToVerify: string) => {
    setEmail(emailToVerify);
    await sendVerificationEmail(emailToVerify, true);
  }, []);

  return {
    visible,
    email,
    showModal,
    hideModal,
    resendVerificationEmail,
  };
} 