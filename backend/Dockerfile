# syntax=docker/dockerfile:1

# Версия должна совпадать с requires-python в pyproject.toml и с CI.
ARG PYTHON_VERSION=3.14

# --- Сборка зависимостей -----------------------------------------------------
FROM python:${PYTHON_VERSION}-slim AS builder

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

# libpq-dev и компилятор нужны только на этапе сборки колёс psycopg.
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential libpq-dev \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# requirements.txt генерируется из uv.lock (`uv export`), поэтому пины полные,
# включая транзитивные зависимости.
COPY requirements.txt .
RUN python -m venv /opt/venv \
 && /opt/venv/bin/pip install -r requirements.txt


# --- Рантайм -----------------------------------------------------------------
FROM python:${PYTHON_VERSION}-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

# В финальном образе из системного — только libpq5 для psycopg и curl для
# healthcheck. Компилятор и заголовки остались в builder-слое.
RUN apt-get update \
 && apt-get install -y --no-install-recommends libpq5 curl \
 && rm -rf /var/lib/apt/lists/* \
 && useradd --create-home --uid 10001 app

COPY --from=builder /opt/venv /opt/venv

WORKDIR /app
COPY . .

# Статика админки и Swagger UI: без неё gunicorn отдаёт страницы без стилей.
# SECRET_KEY на этом шаге не используется по назначению, настройки просто
# должны загрузиться.
RUN SECRET_KEY=build-time-only DEBUG=False python manage.py collectstatic --noinput \
 && chown -R app:app /app

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8000/api/v1/clubs/ || exit 1

# Логи gunicorn — в stdout/stderr, как и логи Django.
CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "3", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
