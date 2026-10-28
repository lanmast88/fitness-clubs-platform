const FALLBACK_MESSAGE = "Не удалось связаться с сервером. Попробуйте позже.";

const STATUS_MESSAGES = {
  400: "Проверьте введённые данные.",
  401: "Нужно войти в аккаунт.",
  403: "Недостаточно прав для этого действия.",
  404: "Запрашиваемые данные не найдены.",
  429: "Слишком много запросов. Попробуйте чуть позже.",
  500: "Ошибка на сервере. Попробуйте позже.",
};

/**
 * Единое представление ошибки API.
 *
 * DRF отдаёт ошибки в нескольких формах: {"detail": "..."},
 * {"field": ["..."]}, {"non_field_errors": ["..."]} или просто строкой.
 * Класс сводит их к одному виду, чтобы компоненты не разбирали ответы сами.
 */
export class ApiError extends Error {
  constructor({ status = 0, message, fieldErrors = {}, payload = null }) {
    super(message || FALLBACK_MESSAGE);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.payload = payload;
  }

  /** Ошибка сети: запрос не дошёл до сервера. */
  static network(cause) {
    return new ApiError({ status: 0, message: FALLBACK_MESSAGE, payload: cause });
  }

  static fromResponse(status, payload) {
    const fieldErrors = {};
    let message = "";

    if (typeof payload === "string" && payload.trim()) {
      message = payload;
    } else if (payload && typeof payload === "object") {
      for (const [field, value] of Object.entries(payload)) {
        const text = Array.isArray(value) ? value.join(" ") : String(value);

        if (field === "detail" || field === "non_field_errors") {
          message = message || text;
        } else {
          fieldErrors[field] = text;
        }
      }

      if (!message) {
        message = Object.values(fieldErrors)[0] || "";
      }
    }

    return new ApiError({
      status,
      message: message || STATUS_MESSAGES[status] || FALLBACK_MESSAGE,
      fieldErrors,
      payload,
    });
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }
}
