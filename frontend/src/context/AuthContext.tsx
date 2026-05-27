import { createContext, useState, useCallback, type ReactNode } from 'react';
import { login as apiLogin } from '../api/auth';
import type { LoginRequest } from '../types';

export interface AuthState {
  token: string | null;
  role: string | null;
  fullName: string | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sa_verify_token'));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('sa_verify_role'));
  const [fullName, setFullName] = useState<string | null>(() => localStorage.getItem('sa_verify_fullname'));

  const login = useCallback(async (data: LoginRequest) => {
    const response = await apiLogin(data);
    localStorage.setItem('sa_verify_token', response.access_token);
    localStorage.setItem('sa_verify_role', response.role);
    localStorage.setItem('sa_verify_fullname', response.full_name);
    setToken(response.access_token);
    setRole(response.role);
    setFullName(response.full_name);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sa_verify_token');
    localStorage.removeItem('sa_verify_role');
    localStorage.removeItem('sa_verify_fullname');
    setToken(null);
    setRole(null);
    setFullName(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        fullName,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
