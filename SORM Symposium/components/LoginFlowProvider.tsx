import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type LoginFlow = 'organizer' | 'attendee' | null;

interface LoginFlowContextType {
  loginFlow: LoginFlow;
  setLoginFlow: (flow: LoginFlow) => void;
  clearLoginFlow: () => void;
}

const LoginFlowContext = createContext<LoginFlowContextType | undefined>(undefined);

const LOGIN_FLOW_STORAGE_KEY = 'loginFlow';

interface LoginFlowProviderProps {
  children: ReactNode;
}

/**
 * Provider to track how the user authenticated (organizer vs attendee flow)
 * Persists the login flow to AsyncStorage for session continuity
 */
export function LoginFlowProvider({ children }: LoginFlowProviderProps) {
  const [loginFlow, setLoginFlowState] = useState<LoginFlow>(null);

  // Load persisted login flow on mount
  useEffect(() => {
    const loadPersistedLoginFlow = async () => {
      try {
        const stored = await AsyncStorage.getItem(LOGIN_FLOW_STORAGE_KEY);
        if (stored && (stored === 'organizer' || stored === 'attendee')) {
          setLoginFlowState(stored as LoginFlow);
        }
      } catch (error) {
        console.error('Failed to load persisted login flow:', error);
      }
    };

    loadPersistedLoginFlow();
  }, []);

  /**
   * Set the login flow and persist it to storage
   * @param flow The login flow type
   */
  const setLoginFlow = async (flow: LoginFlow) => {
    setLoginFlowState(flow);
    
    try {
      if (flow) {
        await AsyncStorage.setItem(LOGIN_FLOW_STORAGE_KEY, flow);
      } else {
        await AsyncStorage.removeItem(LOGIN_FLOW_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to persist login flow:', error);
    }
  };

  /**
   * Clear the login flow from both state and storage
   */
  const clearLoginFlow = async () => {
    setLoginFlowState(null);
    
    try {
      await AsyncStorage.removeItem(LOGIN_FLOW_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear login flow from storage:', error);
    }
  };

  const value: LoginFlowContextType = {
    loginFlow,
    setLoginFlow,
    clearLoginFlow,
  };

  return (
    <LoginFlowContext.Provider value={value}>
      {children}
    </LoginFlowContext.Provider>
  );
}

/**
 * Hook to access login flow context
 * @returns Login flow context with current flow and setter functions
 */
export function useLoginFlow(): LoginFlowContextType {
  const context = useContext(LoginFlowContext);
  
  if (context === undefined) {
    throw new Error('useLoginFlow must be used within a LoginFlowProvider');
  }
  
  return context;
} 