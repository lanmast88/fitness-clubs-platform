import { httpClient } from "./httpClient";

/** Аутентификация и профиль: POST /auth/*, GET|PATCH /users/me/. */
export const authApi = {
  register: ({ email, password, phone }) =>
    httpClient.post(
      "/auth/register/",
      // Телефон уникален в БД, поэтому пустое значение не отправляем.
      phone ? { email, password, phone } : { email, password },
      { auth: false },
    ),

  login: ({ email, password }) =>
    httpClient.post("/auth/login/", { email, password }, { auth: false }),

  logout: (refresh) => httpClient.post("/auth/logout/", { refresh }),

  me: (options) => httpClient.get("/users/me/", options),

  updateMe: (payload) => httpClient.patch("/users/me/", payload),

  changePassword: ({ oldPassword, newPassword }) =>
    httpClient.post("/users/me/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    }),
};
