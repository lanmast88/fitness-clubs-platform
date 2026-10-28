# syntax=docker/dockerfile:1

# Базовый образ devcontainers: непривилегированный пользователь vscode с sudo,
# git, zsh и обвязка для lifecycle-скриптов уже внутри. Python сюда не входит
# намеренно — версию (3.14, см. backend/.python-version) ставит и обновляет uv,
# поэтому образ не может разойтись с uv.lock и с CI.
FROM mcr.microsoft.com/devcontainers/base:bookworm

# libpq5 (приходит с postgresql-client) нужен psycopg в рантайме, он же даёт psql
# в терминале. libpq-dev и компилятор — страховка: для Python 3.14 у части
# зависимостей может не оказаться готового колеса, тогда uv собирает из исходников.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      build-essential \
      libpq-dev \
      postgresql-client \
 && rm -rf /var/lib/apt/lists/*

# uv — тот же инструмент, что в CI. Версия пригвождена: образ должен собираться
# одинаково сегодня и через полгода.
COPY --from=ghcr.io/astral-sh/uv:0.9.30 /uv /uvx /usr/local/bin/

# UV_LINK_MODE=copy: кеш uv и venv лежат в разных томах, хардлинк между ними
# невозможен — без этого uv на каждый sync печатает предупреждение.
ENV UV_LINK_MODE=copy \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
