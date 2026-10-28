import { httpClient } from "./httpClient";

/** Тарифы и абонементы пользователя. */
export const membershipsApi = {
  plans: (options) =>
    httpClient.get("/membership-plans/", { ...options, auth: false }),

  list: (options) => httpClient.get("/memberships/", options),

  /** Для клубного тарифа club обязателен, для сетевого — не передаётся. */
  create: ({ planId, clubId }) =>
    httpClient.post("/memberships/", clubId ? { plan: planId, club: clubId } : { plan: planId }),

  freeze: (membershipId, { fromDate, toDate }) =>
    httpClient.post(`/memberships/${membershipId}/freeze/`, {
      from_date: fromDate,
      to_date: toDate,
    }),

  cancel: (membershipId) => httpClient.post(`/memberships/${membershipId}/cancel/`, {}),
};
