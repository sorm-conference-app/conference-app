import { supabase } from "@/constants/supabase";
import { Session } from "@supabase/supabase-js";
import { ReactNode, useEffect, useState, createContext } from "react"

const AuthSessionContext = createContext<Session | null | undefined>(undefined);

type AuthSessionProviderProps = {
  children: ReactNode;
};

function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
    });
    
    return subscription.unsubscribe;
  }, []);
  
  return (
    <AuthSessionContext.Provider value={session}>
      {children}
    </AuthSessionContext.Provider>
  )
}

export { AuthSessionContext, AuthSessionProvider };