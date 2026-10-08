import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { LoginInput, User } from '../types';
import { api } from './api';
import { ApiError, clearToken, errorMessage, getToken, setToken } from './config';
import { useToast } from '../components/Toast';
interface AuthState { user: User | null; loading: boolean; sessionError: string | null; login: (input: LoginInput) => Promise<void>; logout: () => void; retrySession: () => Promise<void>; }
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true); const [sessionError, setSessionError] = useState<string | null>(null); const toast = useToast();
  const retrySession = useCallback(async () => {
    setLoading(true); setSessionError(null);
    try { if (getToken()) setUser(await api.me()); else setUser(null); }
    catch (error) { setUser(null); if (error instanceof ApiError && error.status === 401) clearToken(); else setSessionError(errorMessage(error)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void retrySession(); }, [retrySession]);
  useEffect(() => {
    const expired = () => { setUser(null); setSessionError(null); toast('로그인이 만료됐어요. 다시 로그인해 주세요.', 'error'); };
    window.addEventListener('board:session-expired', expired); return () => window.removeEventListener('board:session-expired', expired);
  }, [toast]);
  const login = async (input: LoginInput) => { const result = await api.login(input); setToken(result.accessToken); setUser(result.user); setSessionError(null); };
  const logout = () => { clearToken(); setUser(null); setSessionError(null); };
  return <AuthContext.Provider value={{ user, loading, sessionError, login, logout, retrySession }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('AuthProvider is missing'); return context; }
