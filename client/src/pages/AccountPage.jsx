import React from "react";
import Header from "../components/Header";

// Фейковые данные для примера
const userData = {
  name: "Александр Стеков",
  status: "Gold Member",
  daysLeft: 45,
  balance: 2500,
  avatar: "",
};

const upcomingClasses = [
  {
    id: 1,
    title: "Crossfit",
    time: "18:30",
    coach: "Дмитрий В.",
    date: "Сегодня",
  },
  {
    id: 2,
    title: "Yoga Flow",
    time: "10:00",
    coach: "Анна С.",
    date: "Завтра",
  },
  {
    id: 2,
    title: "Yoga Flow",
    time: "10:00",
    coach: "Анна С.",
    date: "Завтра",
  },
];

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0A0B10] text-slate-100">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
            Личный кабинет
          </p>
          <h1 className="mt-2 text-4xl font-bold italic">
            Привет, {userData.name.split(" ")[0]}!
          </h1>
        </div>

        {/* Сетка 50/50 */}
        <div className="grid gap-8 lg:grid-cols-2 items-start">
          {/* ЛЕВАЯ КОЛОНКА */}
          <div className="flex flex-col gap-8">
            {/* Абонемент */}
            <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#9D50BB]/20 to-transparent p-8">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold">
                  Ваш абонемент:{" "}
                  <span className="text-[#9D50BB]">{userData.status}</span>
                </h2>
                <div className="mt-6 flex items-end gap-2">
                  <span className="text-6xl font-black text-white">
                    {userData.daysLeft}
                  </span>
                  <span className="mb-2 text-xl text-slate-400">
                    дней осталось
                  </span>
                </div>
                <div className="mt-6 h-2 w-full rounded-full bg-white/10">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#9D50BB] to-cyan-400 shadow-[0_0_15px_rgba(157,80,187,0.5)]"></div>
                </div>
                <button className="mt-8 rounded-full border border-white/20 px-6 py-2 text-sm font-medium hover:bg-white/5 transition">
                  Продлить доступ
                </button>
              </div>
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#9D50BB]/10 blur-3xl"></div>
            </section>

            {/* Тренировки */}
            <section className="rounded-[32px] border border-white/10 bg-white/5 p-8">
              <h3 className="text-xl font-bold mb-6">Ближайшие занятия</h3>
              <div className="space-y-4">
                {upcomingClasses.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/5 hover:border-[#9D50BB]/50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#9D50BB]/20 text-[#9D50BB]">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-sm sm:text-base">
                          {item.title}
                        </p>
                        <p className="text-[10px] sm:text-xs text-slate-400">
                          {item.date} • {item.time}
                        </p>
                      </div>
                    </div>
                    <button className="text-xs text-rose-400 hover:underline">
                      Отменить
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ПРАВАЯ КОЛОНКА */}
          <div className="flex flex-col gap-8">
            {/* Профиль */}
            <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-center">
              <div className="mx-auto h-24 w-24 rounded-full border-2 border-[#9D50BB] p-1 flex items-center justify-center bg-white/5">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    className="rounded-full h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-slate-600">
                    {userData.name[0]}
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-xl font-bold">{userData.name}</h3>
              <p className="text-sm text-slate-400">ID: 442901</p>
              <button className="mt-6 w-full rounded-2xl bg-white/10 py-3 text-sm font-semibold hover:bg-white/20 transition border border-white/5">
                Редактировать профиль
              </button>
            </section>

            {/* Компактные показатели */}
            <section className="rounded-[32px] border border-white/10 bg-white/5 p-8">
              <h3 className="text-lg font-bold mb-6">Твои показатели</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-black/40 p-5 border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                    Вес
                  </p>
                  <p className="text-2xl font-black text-cyan-300">
                    78 <span className="text-xs font-normal">кг</span>
                  </p>
                </div>
                <div className="rounded-2xl bg-black/40 p-5 border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                    ИМТ
                  </p>
                  <p className="text-2xl font-black text-[#9D50BB]">22.4</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-black/40 p-6 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Посещений в марте
                </p>
                <p className="text-4xl font-black text-white">12</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
