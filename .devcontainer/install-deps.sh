#!/usr/bin/env bash
# updateContentCommand: всё, что зависит только от содержимого репозитория.
# Вынесено отдельно от бутстрапа базы — этот шаг умеет выполняться на prebuild,
# где сервиса db ещё нет, и повторяется при обновлении исходников.
set -euo pipefail

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }

say "Права на тома"
# Именованные тома docker создаёт от root — без chown ни uv, ни npm,
# ни Playwright не смогут в них писать.
sudo chown -R "$(id -u):$(id -g)" \
  backend/.venv \
  client/node_modules \
  "$HOME/.cache"

say "Файлы .env"
# Внутри контейнера настройки приходят из .devcontainer/docker-compose.yml и
# перекрывают .env. Файлы всё равно создаём: они нужны для запуска на хосте
# и для `docker compose up` из корня репозитория.
[ -f .env ] || cp .env.example .env
[ -f client/.env ] || cp client/.env.example client/.env

say "Зависимости бэкенда (uv поставит CPython 3.14)"
# --locked падает, если uv.lock разошёлся с pyproject.toml, — как в CI.
uv sync --locked --project backend

say "Зависимости фронтенда"
npm ci --prefix client

say "Браузер для Playwright"
# Версия браузера должна соответствовать только что установленному
# @playwright/test, поэтому шаг идёт после npm ci.
# --with-deps дотягивает системные библиотеки chromium через sudo.
npm --prefix client exec -- playwright install --with-deps chromium
