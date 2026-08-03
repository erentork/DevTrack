import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  AUTH_UNAUTHORIZED_EVENT,
} from "../api/axios";

import {
  getProfile,
} from "../services/userService";

import type {
  UserProfile,
} from "../types/user";

type AuthContextValue = {
  user: UserProfile | null;

  loading: boolean;

  setUser: (
    user: UserProfile | null
  ) => void;

  refreshProfile:
    () => Promise<void>;

  signIn: (
    token: string
  ) => Promise<void>;

  logout: () => void;
};

const AuthContext =
  createContext<AuthContextValue | null>(
    null
  );

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<UserProfile | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const clearSession =
    useCallback(() => {
      localStorage.removeItem(
        "token"
      );

      setUser(null);
    }, []);

  const refreshProfile =
    useCallback(async () => {
      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const profile =
          await getProfile();

        setUser(profile);
      } catch (error) {
        console.error(
          "Current user could not be loaded:",
          error
        );

        setUser(null);
      } finally {
        setLoading(false);
      }
    }, []);

  const signIn =
    useCallback(
      async (token: string) => {
        localStorage.setItem(
          "token",
          token
        );

        try {
          setLoading(true);

          const profile =
            await getProfile();

          setUser(profile);
        } catch (error) {
          clearSession();

          throw error;
        } finally {
          setLoading(false);
        }
      },
      [clearSession]
    );

  const logout =
    useCallback(() => {
      clearSession();
    }, [clearSession]);

  useEffect(() => {
    function handleUnauthorized() {
      clearSession();
      setLoading(false);
    }

    window.addEventListener(
      AUTH_UNAUTHORIZED_EVENT,
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        AUTH_UNAUTHORIZED_EVENT,
        handleUnauthorized
      );
    };
  }, [clearSession]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        refreshProfile,
        signIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}