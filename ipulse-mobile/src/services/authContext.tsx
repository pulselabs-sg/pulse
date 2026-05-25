import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSessionToken, saveSessionToken, clearSessionToken } from './auth';

interface AuthContextData {
  sessionToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load token from secure store on mount
    getSessionToken().then((token) => {
      if (token) setSessionToken(token);
      setIsLoading(false);
    });
  }, []);

  const signIn = async (token: string) => {
    await saveSessionToken(token);
    setSessionToken(token);
  };

  const signOut = async () => {
    await clearSessionToken();
    setSessionToken(null);
  };

  return (
    <AuthContext.Provider value={{ sessionToken, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
