import { AuthSessionContext } from "@/components/AuthSessionProvider";
import { useContext } from "react";

/**
 * Get the current Supabase auth session state
 * Returns undefined while the provider is initializing; null when unauthenticated; Session when authenticated
 */
function useSupabaseAuth() {
  const context = useContext(AuthSessionContext);
  // Do not throw on undefined; this also represents the loading state during provider initialization
  return context;
}

export default useSupabaseAuth;
