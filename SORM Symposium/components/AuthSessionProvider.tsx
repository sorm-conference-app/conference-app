import { supabase } from "@/constants/supabase";
import { Session } from "@supabase/supabase-js";
import { createContext, ReactNode, useEffect, useState } from "react";

const AuthSessionContext = createContext<Session | null | undefined>(undefined);

type AuthSessionProviderProps = {
  children: ReactNode;
};

function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    let isMounted = true;

    // Initialize session immediately on mount to prevent false unauthenticated redirects
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) setSession(data.session ?? null);
    });

    // Subscribe to auth state changes for live updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (isMounted) setSession(newSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
  return (
    <AuthSessionContext.Provider value={session}>
      {children}
    </AuthSessionContext.Provider>
  )
}

export { AuthSessionContext, AuthSessionProvider };
