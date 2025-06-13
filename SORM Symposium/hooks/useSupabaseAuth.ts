import { AuthSessionContext } from "@/components/AuthSessionProvider";
import { useContext } from "react";

/**
 * Get the current user session.
 * @returns the Session object returned by Supabase, if there is a user session.
 */
function useSupabaseAuth() {
  const context = useContext(AuthSessionContext);

  if (context === undefined) {
    throw new Error(
      "useSupabaseAuth must be used within an AuthSessionProvider."
    );
  }

  return context;
}

export default useSupabaseAuth;
