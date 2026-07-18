import { createContext, useContext, useMemo } from 'react';
import { useWalletContext } from './WalletContext';

const AuthContext = createContext(null);

// Wallet connection *is* the auth session for this app — no separate login step.
// Kept as its own context so a real auth provider (SIWE, session cookie, etc.)
// can be dropped in later without touching every consumer.
export function AuthProvider({ children }) {
  const { address } = useWalletContext();

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(address),
      userId: address,
    }),
    [address]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
