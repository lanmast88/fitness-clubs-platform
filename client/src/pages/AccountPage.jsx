import { useMemo, useState } from "react";

import { authApi } from "../api/auth";
import { membershipsApi } from "../api/memberships";
import { workoutsApi } from "../api/workouts";
import Header from "../components/Header";
import QueryState from "../components/QueryState";
import { formatPrice } from "../components/planPresentation";
import { useApiMutation } from "../hooks/useApiMutation";
import { useApiQuery } from "../hooks/useApiQuery";
import { useAuth } from "../hooks/useAuth";
import { daysUntil, formatDate, formatTime, isFuture } from "../utils/date";

const ROLE_LABELS = {
  client: "Клиент",
  trainer: "Тренер",
  admin: "Администратор",
};

function Panel({ children, className = "" }) {
  return (
    <section className={`rounded-[32px] border border-white/10 bg-white/5 p-8 ${className}`}>
      {children}
    </section>
  );
}

function Stat({ label, value, accent = "text-white" }) {
  return (
    <div className="rounded-2xl bg-black/40 p-5 border border-white/5">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-black ${accent}`}>{value}</p>
    </div>
  );
}

function Dashboard() {
  const { user, isClient, setUser } = useAuth();

  const membershipsQuery = useApiQuery(
    (signal) => membershipsApi.list({ signal }),
    [],
  );
  const bookingsQuery = useApiQuery((signal) => workoutsApi.bookings({ signal }), [], {
    // Бронирования доступны только клиентам — тренеру и админу вернётся 403.
    enabled: isClient,
  });

  const cancelBooking = useApiMutation(workoutsApi.cancelBooking);
  const cancelMembership = useApiMutation(membershipsApi.cancel);
  const savePhone = useApiMutation(authApi.updateMe);

  const [phoneDraft, setPhoneDraft] = useState(null);

  const memberships = membershipsQuery.data || [];
  const activeMembership = memberships.find((item) => item.status === "active") || memberships[0];

  const bookings = useMemo(() => bookingsQuery.data || [], [bookingsQuery.data]);

  const upcoming = useMemo(
    () =>
      bookings
        .filter((booking) => booking.status !== "cancelled" && isFuture(booking.session?.start_ts))
        .sort((a, b) => new Date(a.session.start_ts) - new Date(b.session.start_ts)),
    [bookings],
  );

  const attendedCount = bookings.filter((booking) => booking.status === "attended").length;
  const activeCount = memberships.filter((item) => item.status === "active").length;

  const handleCancelBooking = async (booking) => {
    await cancelBooking.run(booking.session.id).catch(() => {});
    bookingsQuery.reload();
  };

  const handleCancelMembership = async () => {
    await cancelMembership.run(activeMembership.id).catch(() => {});
    membershipsQuery.reload();
  };

  const handleSavePhone = async () => {
    try {
      const updated = await savePhone.run({ phone: phoneDraft.trim() || null });
      setUser(updated);
      setPhoneDraft(null);
    } catch {
      // Сообщение показываем под полем.
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B10] text-slate-100">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Личный кабинет</p>
          <h1 className="mt-2 text-4xl font-bold italic">
            Привет, {user?.email?.split("@")[0]}!
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-start">
          <div className="flex flex-col gap-8">
            <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#9D50BB]/20 to-transparent p-8">
              <div className="relative z-10">
                <QueryState
                  loading={membershipsQuery.loading}
                  error={membershipsQuery.error}
                  isEmpty={!activeMembership}
                  emptyText="Абонемента пока нет — выберите тариф в разделе «Тарифы»."
                  onRetry={membershipsQuery.reload}
                >
                  {activeMembership && (
                    <>
                      <h2 className="text-2xl font-bold">
                        Ваш абонемент:{" "}
                        <span className="text-[#9D50BB]">{activeMembership.plan.title}</span>
                      </h2>
                      <p className="mt-1 text-sm text-slate-400">
                        {activeMembership.status_display} · до{" "}
                        {formatDate(activeMembership.end_date)} ·{" "}
                        {formatPrice(activeMembership.plan.price)} ₽
                      </p>

                      <div className="mt-6 flex items-end gap-2">
                        <span className="text-6xl font-black text-white">
                          {daysUntil(activeMembership.end_date)}
                        </span>
                        <span className="mb-2 text-xl text-slate-400">дней осталось</span>
                      </div>

                      {activeMembership.status === "active" && (
                        <button
                          type="button"
                          onClick={handleCancelMembership}
                          disabled={cancelMembership.loading}
                          className="mt-8 rounded-full border border-white/20 px-6 py-2 text-sm font-medium hover:bg-white/5 transition disabled:opacity-60"
                        >
                          {cancelMembership.loading ? "Отменяем…" : "Отменить абонемент"}
                        </button>
                      )}
                      {cancelMembership.error && (
                        <p className="mt-3 text-sm text-rose-300">
                          {cancelMembership.error.message}
                        </p>
                      )}
                    </>
                  )}
                </QueryState>
              </div>
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#9D50BB]/10 blur-3xl" />
            </section>

            <Panel>
              <h3 className="text-xl font-bold mb-6">Ближайшие занятия</h3>

              {!isClient ? (
                <p className="text-sm text-slate-400">
                  Записи на занятия доступны только с клиентского аккаунта.
                </p>
              ) : (
                <QueryState
                  loading={bookingsQuery.loading}
                  error={bookingsQuery.error}
                  isEmpty={upcoming.length === 0}
                  emptyText="Пока нет записей на занятия."
                  onRetry={bookingsQuery.reload}
                >
                  <div className="space-y-4">
                    {upcoming.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/5 hover:border-[#9D50BB]/50 transition"
                      >
                        <div>
                          <p className="font-bold text-sm sm:text-base">
                            {booking.session.workout_type.title}
                          </p>
                          <p className="text-[10px] sm:text-xs text-slate-400">
                            {formatDate(booking.session.start_ts)} •{" "}
                            {formatTime(booking.session.start_ts)} •{" "}
                            {booking.session.duration} мин
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(booking)}
                          disabled={cancelBooking.loading}
                          className="text-xs text-rose-400 hover:underline disabled:opacity-60"
                        >
                          Отменить
                        </button>
                      </div>
                    ))}
                  </div>
                </QueryState>
              )}

              {cancelBooking.error && (
                <p className="mt-4 text-sm text-rose-300">{cancelBooking.error.message}</p>
              )}
            </Panel>
          </div>

          <div className="flex flex-col gap-8">
            <Panel className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full border-2 border-[#9D50BB] p-1 flex items-center justify-center bg-white/5">
                <span className="text-3xl font-bold text-slate-300 uppercase">
                  {user?.email?.[0]}
                </span>
              </div>

              <h3 className="mt-4 break-all text-xl font-bold">{user?.email}</h3>
              <p className="text-sm text-slate-400">
                ID: {user?.id} · {ROLE_LABELS[user?.role] || user?.role}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Телефон: {user?.phone || "не указан"}
              </p>

              {phoneDraft === null ? (
                <button
                  type="button"
                  onClick={() => setPhoneDraft(user?.phone || "")}
                  className="mt-6 w-full rounded-2xl bg-white/10 py-3 text-sm font-semibold hover:bg-white/20 transition border border-white/5"
                >
                  Редактировать профиль
                </button>
              ) : (
                <div className="mt-6 text-left">
                  <label className="flex flex-col gap-2 text-sm text-slate-300">
                    Телефон
                    <input
                      type="tel"
                      value={phoneDraft}
                      onChange={(event) => setPhoneDraft(event.target.value)}
                      placeholder="+7 (___) ___-__-__"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#9D50BB] focus:outline-none focus:ring-2 focus:ring-[#9D50BB]/30"
                    />
                  </label>

                  {savePhone.error && (
                    <p className="mt-2 text-xs text-rose-300">
                      {savePhone.error.fieldErrors?.phone || savePhone.error.message}
                    </p>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={handleSavePhone}
                      disabled={savePhone.loading}
                      className="flex-1 rounded-2xl bg-[#9D50BB] py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                    >
                      {savePhone.loading ? "Сохраняем…" : "Сохранить"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoneDraft(null)}
                      className="flex-1 rounded-2xl border border-white/20 py-3 text-sm font-semibold transition hover:bg-white/10"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </Panel>

            <Panel>
              <h3 className="text-lg font-bold mb-6">Твои показатели</h3>
              <div className="grid grid-cols-2 gap-4">
                <Stat label="Активных абонементов" value={activeCount} accent="text-cyan-300" />
                <Stat label="Предстоящих занятий" value={upcoming.length} accent="text-[#9D50BB]" />
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-black/40 p-6 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Посещено занятий
                </p>
                <p className="text-4xl font-black text-white">{attendedCount}</p>
              </div>
            </Panel>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
