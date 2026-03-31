import { useState, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

const TOKEN_KEY = "jia_token";
const USER_ID_KEY = "jia_user_id";

interface AuthHook {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useAuth(): AuthHook {
  const { handleLogin, handleLogout: ctxLogout } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const login = useCallback(
  //   async (email: string, password: string) => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const res = await api.auth.login({ email, password });
  //       localStorage.setItem(TOKEN_KEY, res.token);
  //       localStorage.setItem(USER_ID_KEY, res.user_id);
  //       handleLogin(res.email);
  //     } catch (err: unknown) {
  //       setError(
  //         err instanceof Error
  //           ? err.message
  //           : "Login failed. Please try again.",
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [handleLogin],
  // );
  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.auth.login({ email, password });

        // ✅ FIX: unwrap Bubble response
        const data = (res as any).response;

        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_ID_KEY, data.user_id);
        localStorage.setItem("jia_email", email); // since API doesn't return it

        handleLogin(email);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Login failed. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [handleLogin],
  );
  // const signup = useCallback(
  //   async (email: string, password: string, phone: string) => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const res = await api.auth.signup({ email, password, phone });
  //       localStorage.setItem(TOKEN_KEY, res.token);
  //       localStorage.setItem(USER_ID_KEY, res.user_id);
  //       handleLogin(res.email);
  //     } catch (err: unknown) {
  //       setError(
  //         err instanceof Error
  //           ? err.message
  //           : "Sign up failed. Please try again.",
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [handleLogin],
  // );
  const signup = useCallback(
    async (email: string, password: string, phone: string) => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.auth.signup({ email, password, phone });

        // ✅ FIX
        const data = (res as any).response;

        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_ID_KEY, data.user_id);
        localStorage.setItem("jia_email", email);

        handleLogin(email);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Sign up failed. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [handleLogin],
  );
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.auth.logout().catch(() => {}); // best-effort
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_ID_KEY);
      ctxLogout();
      setLoading(false);
    }
  }, [ctxLogout]);

  return { login, signup, logout, loading, error };
}
