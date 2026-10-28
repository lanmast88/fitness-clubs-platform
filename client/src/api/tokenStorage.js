// Абстракция над хранилищем токенов: остальной код не знает про localStorage.
const ACCESS_KEY = "stack-fitness.access";
const REFRESH_KEY = "stack-fitness.refresh";

function read(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    if (value) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Приватный режим или заблокированное хранилище — работаем без персиста.
  }
}

export const tokenStorage = {
  getAccess: () => read(ACCESS_KEY),
  getRefresh: () => read(REFRESH_KEY),

  save({ access, refresh }) {
    if (access !== undefined) write(ACCESS_KEY, access);
    if (refresh !== undefined) write(REFRESH_KEY, refresh);
  },

  clear() {
    write(ACCESS_KEY, null);
    write(REFRESH_KEY, null);
  },

  get hasSession() {
    return Boolean(read(REFRESH_KEY));
  },
};
