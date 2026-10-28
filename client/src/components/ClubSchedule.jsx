import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { clubsApi } from "../api/clubs";
import { workoutsApi } from "../api/workouts";
import { useApiMutation } from "../hooks/useApiMutation";
import { useApiQuery } from "../hooks/useApiQuery";
import { useAuth } from "../hooks/useAuth";
import { formatTime, toIsoDate } from "../utils/date";
import QueryState from "./QueryState";

const DAYS_BEFORE = 3;
const DAYS_AFTER = 5;

function buildDays() {
  const days = [];

  for (let offset = -DAYS_BEFORE; offset <= DAYS_AFTER; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + offset);

    days.push({
      iso: toIsoDate(date),
      label: date.toLocaleDateString("ru-RU", { weekday: "short" }).replace(".", ""),
      dayOfMonth: date.getDate(),
    });
  }

  return days;
}

/**
 * Расписание клуба на выбранный день + запись на занятие.
 * Расписание и правила записи целиком на стороне API — компонент только
 * показывает ответ и отправляет действие пользователя.
 */
function ClubSchedule({ clubId }) {
  const navigate = useNavigate();
  const { isAuthenticated, isClient } = useAuth();

  const days = useMemo(() => buildDays(), []);
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()));
  const [bookedSessionIds, setBookedSessionIds] = useState([]);

  const scheduleQuery = useApiQuery(
    (signal) => clubsApi.schedule(clubId, selectedDate, { signal }),
    [clubId, selectedDate],
  );

  const book = useApiMutation(workoutsApi.book);

  const handleBook = async (session) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/clubs/${clubId}` } });
      return;
    }

    try {
      await book.run(session.id);
      setBookedSessionIds((prev) => [...prev, session.id]);
      scheduleQuery.reload();
    } catch {
      // Причину отказа (нет мест, уже записан) показываем под списком.
    }
  };

  const sessions = scheduleQuery.data || [];

  return (
    <div>
      <h2 className="text-2xl font-semibold">Расписание занятий</h2>

      <div className="mt-4 overflow-x-auto">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 p-2">
          {days.map((day) => (
            <button
              key={day.iso}
              type="button"
              onClick={() => setSelectedDate(day.iso)}
              className={`flex w-16 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-sm transition ${
                selectedDate === day.iso
                  ? "bg-[#9D50BB] text-white shadow-[0_0_16px_rgba(157,80,187,0.6)]"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <span className="text-xs uppercase text-slate-400">{day.label}</span>
              <span className="text-lg font-semibold">{day.dayOfMonth}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#0A0B10]/60 p-4">
        <QueryState
          loading={scheduleQuery.loading}
          error={scheduleQuery.error}
          isEmpty={sessions.length === 0}
          emptyText="На этот день занятий нет."
          onRetry={scheduleQuery.reload}
        >
          {sessions.map((session) => {
            const justBooked = bookedSessionIds.includes(session.id);
            const soldOut = session.spots_left === 0;

            return (
              <div
                key={session.id}
                className="flex items-start justify-between gap-4 border-b border-white/10 py-4 last:border-b-0"
              >
                <div className="w-24">
                  <div className="text-lg font-semibold text-white">
                    {formatTime(session.start_ts)}
                  </div>
                  <div className="text-sm text-slate-400">{session.duration} мин</div>
                </div>

                <div className="flex-1">
                  <div className="text-lg font-semibold text-white">{session.workout_type}</div>
                  <div className="text-sm text-slate-400">
                    {session.room}
                    {session.trainer ? ` · ${session.trainer.email}` : ""}
                  </div>
                  <div className="text-xs text-slate-500">
                    Свободно мест: {session.spots_left} из {session.capacity}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBook(session)}
                  disabled={book.loading || justBooked || soldOut || (isAuthenticated && !isClient)}
                  className="shrink-0 rounded-full bg-[#9D50BB] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {justBooked ? "Вы записаны" : soldOut ? "Мест нет" : "Записаться"}
                </button>
              </div>
            );
          })}
        </QueryState>

        {isAuthenticated && !isClient && (
          <p className="mt-4 text-sm text-amber-200">
            Записаться на занятие можно только с клиентского аккаунта.
          </p>
        )}
        {book.error && <p className="mt-4 text-sm text-rose-300">{book.error.message}</p>}
      </div>
    </div>
  );
}

export default ClubSchedule;
