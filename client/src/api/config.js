// Единая точка настройки адреса API.
// Переопределяется через VITE_API_URL в .env (см. .env.example).
const DEFAULT_BASE_URL = "http://localhost:8000/api/v1";

export const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_BASE_URL)
  .trim()
  .replace(/\/+$/, "");
