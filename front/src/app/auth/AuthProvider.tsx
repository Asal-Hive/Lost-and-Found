import React, { createContext, useContext, useMemo, useState } from "react";

type AuthUser = {
  email: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!user,
      user,
      login: (email: string) => setUser({ email }),
      logout: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
