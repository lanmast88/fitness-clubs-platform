import { API_BASE_URL } from "./config";
import { ApiError } from "./ApiError";
import { tokenStorage } from "./tokenStorage";

/**
 * Транспортный слой: единственное место, где проект знает про fetch, JWT
 * и формат ошибок DRF. Ресурсные модули (auth, clubs, ...) описывают только
 * свои эндпоинты и ничего не знают про заголовки и обновление токена.
 */

// Подписчик на окончательную потерю сессии. Ставит AuthProvider,
// чтобы транспорт не зависел от React-контекста.
let onSessionExpired = () => {};

export function setSessionExpiredHandler(handler) {
  onSessionExpired = typeof handler === "function" ? handler : () => {};
}

// Параллельные 401 должны вызвать refresh один раз, а не по разу на запрос.
let refreshPromise = null;

function buildUrl(path, query) {
  const url = new URL(`${API_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function parseBody(response) {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function send(path, { method = "GET", body, query, auth = true, signal } = {}) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const accessToken = auth ? tokenStorage.getAccess() : null;
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    if (cause?.name === "AbortError") throw cause;
    throw ApiError.network(cause);
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    throw ApiError.fromResponse(response.status, payload);
  }

  return payload;
}

async function refreshAccessToken() {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return false;

  if (!refreshPromise) {
    refreshPromise = send("/auth/refresh/", {
      method: "POST",
      body: { refresh },
      auth: false,
    })
      .then((data) => {
        tokenStorage.save({ access: data.access, refresh: data.refresh });
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

/**
 * Выполняет запрос и при протухшем access-токене один раз обновляет его
 * и повторяет запрос. Если обновить не удалось — сессия считается потерянной.
 */
export async function request(path, options = {}) {
  const { auth = true } = options;

  try {
    return await send(path, options);
  } catch (error) {
    const canRetry = auth && error instanceof ApiError && error.isUnauthorized;
    if (!canRetry) throw error;

    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      tokenStorage.clear();
      onSessionExpired();
      throw error;
    }

    return send(path, options);
  }
}

export const httpClient = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
