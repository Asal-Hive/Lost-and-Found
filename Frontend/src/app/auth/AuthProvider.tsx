import React, { createContext, useContext, useMemo, useState } from "react";

type AuthUser = {
  email: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, tokens?: { access?: string; refresh?: string } | null, remember?: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
      if (raw) return JSON.parse(raw) as AuthUser;
    } catch (e) {}
    return null;
  });

  const [tokens, setTokens] = useState<{ access?: string; refresh?: string } | null>(() => {
    try {
      const raw = localStorage.getItem('auth_tokens') || sessionStorage.getItem('auth_tokens');
      if (raw) return JSON.parse(raw) as { access?: string; refresh?: string };
    } catch (e) {}
    return null;
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!user,
      user,
      login: (email: string, tokensArg?: { access?: string; refresh?: string } | null, remember: boolean = false) => {
        const u = { email };
        setUser(u);
        setTokens(tokensArg || null);
        try {
          if (remember) {
            localStorage.setItem('auth_user', JSON.stringify(u));
            if (tokensArg) localStorage.setItem('auth_tokens', JSON.stringify(tokensArg));
          } else {
            sessionStorage.setItem('auth_user', JSON.stringify(u));
            if (tokensArg) sessionStorage.setItem('auth_tokens', JSON.stringify(tokensArg));
          }
        } catch (e) {}
      },
      logout: () => {
        setUser(null);
        setTokens(null);
        try {
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_tokens');
          sessionStorage.removeItem('auth_user');
          sessionStorage.removeItem('auth_tokens');
        } catch (e) {}
      },
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
