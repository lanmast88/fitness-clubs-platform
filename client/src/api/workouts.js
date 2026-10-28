import { httpClient } from "./httpClient";

/** Тренировки: типы, сессии, записи и персональные тренировки. */
export const workoutsApi = {
  types: (options) => httpClient.get("/workout-types/", { ...options, auth: false }),

  sessions: (options) => httpClient.get("/sessions/", { ...options, auth: false }),

  session: (sessionId, options) =>
    httpClient.get(`/sessions/${sessionId}/`, { ...options, auth: false }),

  book: (sessionId) => httpClient.post(`/sessions/${sessionId}/book/`, {}),

  cancelBooking: (sessionId) => httpClient.post(`/sessions/${sessionId}/cancel-book/`, {}),

  bookings: (options) => httpClient.get("/bookings/", options),

  personalTrainings: (options) => httpClient.get("/personal-trainings/", options),

  createPersonalTraining: ({ trainerId, startTs, durationMinutes }) =>
    httpClient.post("/personal-trainings/", {
      trainer: trainerId,
      start_ts: startTs,
      duration_minutes: durationMinutes,
    }),

  cancelPersonalTraining: (trainingId) =>
    httpClient.post(`/personal-trainings/${trainingId}/cancel/`, {}),
};
