import { createContext } from "react";

/**
 * Контекст сессии. Вынесен из файла провайдера, чтобы .jsx-модуль
 * экспортировал только компонент (требование react-refresh).
 */
export const AuthContext = createContext(null);

export const AUTH_STATUS = {
  LOADING: "loading",
  AUTHENTICATED: "authenticated",
  ANONYMOUS: "anonymous",
};
