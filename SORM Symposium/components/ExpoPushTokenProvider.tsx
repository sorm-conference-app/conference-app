import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

const ExpoPushTokenContext = createContext<string | null>(null);

type ExpoPushTokenProviderProps = {
  children: ReactNode;
};

function ExpoPushTokenProvider({ children }: ExpoPushTokenProviderProps) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Request permission to send notifications
  }, []);

  return (
    <ExpoPushTokenContext.Provider value={token}>
      {children}
    </ExpoPushTokenContext.Provider>
  );
}

export { ExpoPushTokenContext, ExpoPushTokenProvider };
