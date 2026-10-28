#!/usr/bin/env bash
# postCreateCommand: шаги, которым нужна живая база.
set -euo pipefail

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }

say "Ожидание PostgreSQL"
# depends_on: service_healthy отрабатывает при старте стека, но ждать всё равно
# нужно: том базы могли восстановить, и postgres успеет только начать recovery.
# Адрес и доступ pg_isready берёт из переменных PG*, заданных в compose.
for attempt in $(seq 1 60); do
  if pg_isready -q; then
    break
  fi
  if [ "$attempt" -eq 60 ]; then
    echo "База не ответила за 60 секунд — проверьте сервис db" >&2
    exit 1
  fi
  sleep 1
done

say "Миграции"
uv run --project backend --directory backend python manage.py migrate

say "Демо-данные"
# Идемпотентно: создаёт клубы, тарифы, занятия и учётки admin/trainer,
# повторный запуск ничего не дублирует.
uv run --project backend --directory backend python manage.py seed_demo

cat <<'HINT'

Окружение готово. Серверы и проверки — через задачи VS Code (Ctrl/Cmd+Shift+B
или «Tasks: Run Task»), отладка Django — по F5. То же самое вручную:

  Бэкенд:    cd backend && uv run python manage.py runserver 0.0.0.0:8000
  Фронтенд:  cd client  && npm run dev -- --host 0.0.0.0
  Проверки:  cd backend && uv run ruff check . && uv run python manage.py test
             cd client  && npm run lint && npm run build && npm run test:e2e
  База:      psql                 (переменные PG* уже заданы)

HINT
