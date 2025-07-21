import useSupabaseAuth from "./useSupabaseAuth";

/**
 * Hook to determine if the current user has admin role
 * @returns true if user is authenticated and has role 'admin' in app_metadata
 */
export function useIsAdmin(): boolean {
  const session = useSupabaseAuth();
  
  if (!session?.user) {
    return false;
  }
  
  // Check if user has admin role in app_metadata
  const role = session.user.app_metadata?.role;
  return role === 'admin';
} 