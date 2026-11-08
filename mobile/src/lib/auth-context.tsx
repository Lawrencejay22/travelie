import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '../types';
import { api, configureSessionBridge } from './api';
import {
  clearStoredSession,
  readStoredSession,
  saveStoredSession,
} from './session-storage';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signUp: (payload: {
    email: string;
    displayName: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const sessionRef = useRef<Session | null>(null);

  const applySession = useCallback(async (next: Session | null) => {
    sessionRef.current = next;
    setSession(next);
    if (next) {
      await saveStoredSession(next);
    } else {
      await clearStoredSession();
    }
  }, []);

  useEffect(() => {
    configureSessionBridge(
      () => sessionRef.current,
      async (next) => {
        sessionRef.current = next;
        setSession(next);
        if (next) {
          await saveStoredSession(next);
        } else {
          await clearStoredSession();
        }
      },
    );

    readStoredSession()
      .then((stored) => {
        sessionRef.current = stored;
        setSession(stored);
      })
      .finally(() => setInitializing(false));
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const next = await api.login({ email: email.trim(), password });
      await applySession(next);
    },
    [applySession],
  );

  const signUp = useCallback(
    async (payload: {
      email: string;
      displayName: string;
      password: string;
    }) => {
      const next = await api.register({
        ...payload,
        email: payload.email.trim(),
      });
      await applySession(next);
    },
    [applySession],
  );

  const signInWithGoogle = useCallback(
    async (idToken: string) => {
      const next = await api.googleLogin(idToken);
      await applySession(next);
    },
    [applySession],
  );

  const signOut = useCallback(async () => {
    const token = sessionRef.current?.refreshToken;
    try {
      if (token) await api.logout(token);
    } finally {
      await applySession(null);
    }
  }, [applySession]);

  const updateUser = useCallback(
    async (user: User) => {
      const current = sessionRef.current;
      if (!current) return;
      await applySession({ ...current, user });
    },
    [applySession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      initializing,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      updateUser,
    }),
    [
      session,
      initializing,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
