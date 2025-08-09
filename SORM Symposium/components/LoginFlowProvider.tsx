import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type LoginFlow = 'organizer' | 'attendee' | null;

interface LoginFlowContextType {
  loginFlow: LoginFlow;
  requiresPasswordChange: boolean;
  setLoginFlow: (flow: LoginFlow) => void;
  setRequiresPasswordChange: (required: boolean) => void;
  clearLoginFlow: () => void;
}

const LoginFlowContext = createContext<LoginFlowContextType | undefined>(undefined);

const LOGIN_FLOW_STORAGE_KEY = 'loginFlow';
const PASSWORD_CHANGE_STORAGE_KEY = 'requiresPasswordChange';

interface LoginFlowProviderProps {
  children: ReactNode;
}

/**
 * Provider to track how the user authenticated (organizer vs attendee flow)
 * Persists the login flow to AsyncStorage for session continuity
 */
export function LoginFlowProvider({ children }: LoginFlowProviderProps) {
  const [loginFlow, setLoginFlowState] = useState<LoginFlow>(null);
  const [requiresPasswordChange, setRequiresPasswordChangeState] = useState<boolean>(false);

  // Load persisted login flow and password change requirement on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const stored = await AsyncStorage.getItem(LOGIN_FLOW_STORAGE_KEY);
        if (stored && (stored === 'organizer' || stored === 'attendee')) {
          setLoginFlowState(stored as LoginFlow);
        }

        const passwordChangeRequired = await AsyncStorage.getItem(PASSWORD_CHANGE_STORAGE_KEY);
        if (passwordChangeRequired === 'true') {
          setRequiresPasswordChangeState(true);
        }
      } catch (error) {
        console.error('Failed to load persisted data:', error);
      }
    };

    loadPersistedData();
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
   * Set the password change requirement and persist it to storage
   * @param required Whether password change is required
   */
  const setRequiresPasswordChange = async (required: boolean) => {
    setRequiresPasswordChangeState(required);
    
    try {
      if (required) {
        await AsyncStorage.setItem(PASSWORD_CHANGE_STORAGE_KEY, 'true');
      } else {
        await AsyncStorage.removeItem(PASSWORD_CHANGE_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to persist password change requirement:', error);
    }
  };

  /**
   * Clear the login flow from both state and storage
   */
  const clearLoginFlow = async () => {
    setLoginFlowState(null);
    setRequiresPasswordChangeState(false);
    
    try {
      await AsyncStorage.removeItem(LOGIN_FLOW_STORAGE_KEY);
      await AsyncStorage.removeItem(PASSWORD_CHANGE_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear login flow from storage:', error);
    }
  };

  const value: LoginFlowContextType = {
    loginFlow,
    requiresPasswordChange,
    setLoginFlow,
    setRequiresPasswordChange,
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