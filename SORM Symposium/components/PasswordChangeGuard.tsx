import { useLoginFlow } from '@/components/LoginFlowProvider';
import { router, usePathname } from 'expo-router';
import { ReactNode, useEffect } from 'react';

interface PasswordChangeGuardProps {
  children: ReactNode;
}

/**
 * Guard component that redirects to login if admin requires password change
 * Prevents access to protected routes until password is changed
 */
export default function PasswordChangeGuard({ children }: PasswordChangeGuardProps) {
  const { requiresPasswordChange, loginFlow } = useLoginFlow();
  const pathname = usePathname();

  useEffect(() => {
    // If admin is logged in but requires password change, and trying to access protected routes
    if (loginFlow === 'organizer' && requiresPasswordChange && pathname !== '/') {
      console.log('Password change required - redirecting to login from:', pathname);
      router.replace('/');
    }
  }, [requiresPasswordChange, loginFlow, pathname]);

  // Don't render protected content if password change is required and not on login page
  if (loginFlow === 'organizer' && requiresPasswordChange && pathname !== '/') {
    return null;
  }

  return <>{children}</>;
}
