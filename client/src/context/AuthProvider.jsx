import { useCallback, useEffect, useMemo, useState } from "react";

import { authApi } from "../api/auth";
import { setSessionExpiredHandler } from "../api/httpClient";
import { tokenStorage } from "../api/tokenStorage";
import { AUTH_STATUS, AuthContext } from "./AuthContext";

/**
 * Единственный владелец состояния сессии: токены, текущий пользователь,
 * вход, регистрация и выход. Страницы работают только через useAuth().
 */
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(
    tokenStorage.hasSession ? AUTH_STATUS.LOADING : AUTH_STATUS.ANONYMOUS,
  );

  const resetSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus(AUTH_STATUS.ANONYMOUS);
  }, []);

  const loadProfile = useCallback(async () => {
    const profile = await authApi.me();
    setUser(profile);
    setStatus(AUTH_STATUS.AUTHENTICATED);
    return profile;
  }, []);

  // Транспорт сообщает сюда, что refresh-токен окончательно протух.
  useEffect(() => {
    setSessionExpiredHandler(resetSession);
    return () => setSessionExpiredHandler(null);
  }, [resetSession]);

  // Восстановление сессии после перезагрузки страницы.
  useEffect(() => {
    if (!tokenStorage.hasSession) return;

    loadProfile().catch(() => resetSession());
  }, [loadProfile, resetSession]);

  const startSession = useCallback(
    async (tokens) => {
      tokenStorage.save({ access: tokens.access, refresh: tokens.refresh });
      setStatus(AUTH_STATUS.LOADING);

      try {
        return await loadProfile();
      } catch (error) {
        resetSession();
        throw error;
      }
    },
    [loadProfile, resetSession],
  );

  const login = useCallback(
    async (credentials) => startSession(await authApi.login(credentials)),
    [startSession],
  );

  const register = useCallback(
    async (payload) => {
      const { user: created, ...tokens } = await authApi.register(payload);
      await startSession(tokens);
      return created;
    },
    [startSession],
  );

  const logout = useCallback(async () => {
    const refresh = tokenStorage.getRefresh();

    try {
      if (refresh) await authApi.logout(refresh);
    } catch {
      // Токен мог протухнуть — локальную сессию всё равно закрываем.
    } finally {
      resetSession();
    }
  }, [resetSession]);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === AUTH_STATUS.AUTHENTICATED,
      isLoading: status === AUTH_STATUS.LOADING,
      isClient: user?.role === "client",
      login,
      register,
      logout,
      refreshProfile: loadProfile,
      setUser,
    }),
    [user, status, login, register, logout, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
