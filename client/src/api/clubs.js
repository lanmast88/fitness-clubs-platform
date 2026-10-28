import { httpClient } from "./httpClient";

/** Клубы, залы и расписание. Доступно без авторизации. */
export const clubsApi = {
  list: (options) => httpClient.get("/clubs/", { ...options, auth: false }),

  retrieve: (clubId, options) =>
    httpClient.get(`/clubs/${clubId}/`, { ...options, auth: false }),

  rooms: (clubId, options) =>
    httpClient.get(`/clubs/${clubId}/rooms/`, { ...options, auth: false }),

  /** @param {string} date — ISO-дата YYYY-MM-DD */
  schedule: (clubId, date, options) =>
    httpClient.get(`/clubs/${clubId}/schedule/`, {
      ...options,
      auth: false,
      query: { date },
    }),
};
