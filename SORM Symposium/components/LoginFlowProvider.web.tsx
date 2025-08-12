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
 * Persists the login flow to localStorage for session continuity on web
 */
export function LoginFlowProvider({ children }: LoginFlowProviderProps) {
  const [loginFlow, setLoginFlowState] = useState<LoginFlow>(null);
  const [requiresPasswordChange, setRequiresPasswordChangeState] = useState<boolean>(false);

  // Load persisted login flow and password change requirement on mount
  useEffect(() => {
    const loadPersistedData = () => {
      try {
        const stored = localStorage.getItem(LOGIN_FLOW_STORAGE_KEY);
        if (stored && (stored === 'organizer' || stored === 'attendee')) {
          setLoginFlowState(stored as LoginFlow);
        }

        const passwordChangeRequired = localStorage.getItem(PASSWORD_CHANGE_STORAGE_KEY);
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
  const setLoginFlow = (flow: LoginFlow) => {
    setLoginFlowState(flow);
    
    try {
      if (flow) {
        localStorage.setItem(LOGIN_FLOW_STORAGE_KEY, flow);
      } else {
        localStorage.removeItem(LOGIN_FLOW_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to persist login flow:', error);
    }
  };

  /**
   * Set the password change requirement and persist it to storage
   * @param required Whether password change is required
   */
  const setRequiresPasswordChange = (required: boolean) => {
    setRequiresPasswordChangeState(required);
    
    try {
      if (required) {
        localStorage.setItem(PASSWORD_CHANGE_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(PASSWORD_CHANGE_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to persist password change requirement:', error);
    }
  };

  /**
   * Clear the login flow from both state and storage
   */
  const clearLoginFlow = () => {
    setLoginFlowState(null);
    setRequiresPasswordChangeState(false);
    
    try {
      localStorage.removeItem(LOGIN_FLOW_STORAGE_KEY);
      localStorage.removeItem(PASSWORD_CHANGE_STORAGE_KEY);
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
