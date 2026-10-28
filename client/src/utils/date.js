/** Общие операции с датами, чтобы форматирование не расползалось по страницам. */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Дата в формате YYYY-MM-DD по локальному времени (его ждёт API расписания). */
export function toIsoDate(date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Сколько полных дней осталось до даты; 0 — если дата уже прошла. */
export function daysUntil(value) {
  if (!value) return 0;

  const target = new Date(value);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return Math.max(Math.round((target - today) / DAY_MS), 0);
}

export function isFuture(value) {
  return Boolean(value) && new Date(value).getTime() > Date.now();
}
