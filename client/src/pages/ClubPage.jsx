import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { clubs } from "../components/clubs";
import { trainersByClub } from "../components/trainers";
import {
  GroupTraining,
  Parking,
  SpaZone,
  TwoStory,
  WorkHours,
} from "../assets/Icons/Icons";

function ClubPage() {
  const { id } = useParams();
  const club = clubs.find((item) => String(item.id) === String(id));
  const [photoIndex, setPhotoIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());

  const photos = club.name.includes("Авиапарк")
    ? [
        { id: 1, label: "Зал Авиапарк 1", src: "/aviapark_1.png" },
        { id: 2, label: "Зал Авиапарк 2", src: "/aviapark_2.jpg" },
        { id: 3, label: "Зал Авиапарк 3", src: "/aviapark_3.jpg" },
      ]
    : [
        { id: 1, label: "Фото зала 1", src: "" },
        { id: 2, label: "Фото зала 2", src: "" },
        { id: 3, label: "Фото зала 3", src: "" },
      ];

  const features = [
    {
      key: "group",
      title: "Групповые занятия",
      description: "Йога, пилатес, HIIT и функциональные тренировки.",
      icon: <GroupTraining className="h-6 w-6 text-[#9D50BB]" />,
    },
    {
      key: "hours",
      title: "Время работы",
      description: club.timezone,
      icon: <WorkHours className="h-6 w-6 text-cyan-200" />,
    },
    {
      key: "parking",
      title: "Парковка",
      description: "Удобная парковка рядом с входом.",
      icon: <Parking className="h-6 w-6 text-emerald-200" />,
    },
    {
      key: "spa",
      title: "SPA зона",
      description: "Зона восстановления и релакса после тренировок.",
      icon: <SpaZone className="h-6 w-6 text-fuchsia-200" />,
    },
  ];
  if (club.name.includes("Маяковская") || club.name.includes("Авиапарк")) {
    features.push({
      key: "twostory",
      title: "Двухэтажный зал",
      description: "Больше пространства для тренировок.",
      icon: <TwoStory className="h-6 w-6 text-amber-200" />,
    });
    features.push({
      key: "modern",
      title: "Современное оборудование",
      description: "Новые тренажеры и свободные веса.",
      icon: <GroupTraining className="h-6 w-6 text-indigo-200" />,
    });
  }

  const trainers = trainersByClub[club.id] || trainersByClub.default;

  const dayCards = useMemo(() => {
    const cards = [];
    for (let offset = -3; offset <= 5; offset += 1) {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      const dayLabel = date
        .toLocaleDateString("ru-RU", { weekday: "short" })
        .replace(".", "");
      cards.push({
        key: date.toDateString(),
        day: dayLabel,
        date: date.getDate(),
      });
    }
    return cards;
  }, []);

  if (!club) {
    return (
      <div className="min-h-screen bg-[#0A0B10] text-slate-100">
        <Header />
        <main className="mx-auto max-w-6xl px-4 pt-6 pb-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Клуб не найден</h1>
          <p className="mt-2 text-slate-300">
            Проверьте ссылку или выберите клуб из меню.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B10] text-slate-100">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
            Клуб
          </p>
          <h1 className="mt-2 text-4xl font-bold">{club.name}</h1>
          <p className="mt-3 max-w-2xl text-slate-300">{club.address}</p>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
            <div className="grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.key} className="flex flex-col gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#9D50BB]">
                    {feature.icon}
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {feature.title}
                  </div>
                  <div className="text-xs text-slate-400">
                    {feature.description}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="relative h-[360px] w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1f2330] via-[#0f1118] to-[#2d2550]">
                <div className="absolute right-4 top-4 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#9D50BB]">
                  Смотреть 3D-тур
                </div>
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() =>
                      setPhotoIndex(
                        (prev) => (prev - 1 + photos.length) % photos.length,
                      )
                    }
                    className="h-10 w-10 rounded-full border border-white/20 bg-[#0A0B10]/60 text-white transition hover:bg-white/10"
                    aria-label="Предыдущее фото"
                  >
                    ←
                  </button>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() =>
                      setPhotoIndex((prev) => (prev + 1) % photos.length)
                    }
                    className="h-10 w-10 rounded-full border border-white/20 bg-[#0A0B10]/60 text-white transition hover:bg-white/10"
                    aria-label="Следующее фото"
                  >
                    →
                  </button>
                </div>
                {photos[photoIndex].src ? (
                  <img
                    src={photos[photoIndex].src}
                    alt={photos[photoIndex].label}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300">
                    {photos[photoIndex].label} (заглушка)
                  </div>
                )}
              </div>
              <div className="mt-4 flex w-full items-center justify-center gap-2">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setPhotoIndex(index)}
                    className={`h-2 rounded-full transition ${
                      index === photoIndex
                        ? "w-8 bg-white"
                        : "w-2 bg-white/30 hover:bg-white/60"
                    }`}
                    aria-label={`Фото ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-2xl font-semibold">Расписание занятий</h2>
              <div className="mt-4 overflow-x-auto">
                <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 p-2">
                  {dayCards.map((day) => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setSelectedDay(day.date)}
                      className={`flex w-16 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-sm transition ${
                        selectedDay === day.date
                          ? "bg-[#9D50BB] text-white shadow-[0_0_16px_rgba(157,80,187,0.6)]"
                          : "text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-xs uppercase text-slate-400">
                        {day.day}
                      </span>
                      <span className="text-lg font-semibold">{day.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-[#0A0B10]/60 p-4">
                {[
                  {
                    time: "10:00",
                    duration: "45 мин",
                    name: "Здоровая спина 45",
                    coach: "Артем Селиванов",
                  },
                  {
                    time: "10:00",
                    duration: "30 мин",
                    name: "Smart Start",
                    coach: "Рамиль Юсеев",
                  },
                  {
                    time: "11:00",
                    duration: "45 мин",
                    name: "Stack ATHLETIC 45",
                    coach: "Артем Селиванов",
                  },
                  {
                    time: "10:00",
                    duration: "45 мин",
                    name: "Здоровая спина 45",
                    coach: "Артем Селиванов",
                  },
                ].map((session) => (
                  <div
                    key={`${session.time}-${session.name}`}
                    className="flex items-start justify-between gap-4 border-b border-white/10 py-4 last:border-b-0"
                  >
                    <div className="w-24">
                      <div className="text-lg font-semibold text-white">
                        {session.time}
                      </div>
                      <div className="text-sm text-slate-400">
                        {session.duration}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-white">
                        {session.name}
                      </div>
                      <div className="text-sm text-slate-400">
                        {session.coach}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0A0B10]/60 p-6">
              <h2 className="text-2xl font-semibold">Групповые тренировки</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Stack PUMP",
                  "Smart Start",
                  "Lady Style 45",
                  "Школа шпагата 45",
                  "Stack CORE",
                  "Stack ATHLETIC 45",
                  "3D Ягодицы 45",
                  "Здоровая спина 45",
                  "Stretching 45",
                  "Stack COMBAT",
                  "Yoga",
                  "Stack Balance",
                  "Step pro 45",
                  "Stack Pilates",
                  "Inside Flow Yoga 90",
                  "Stack Party",
                  "MAKE BODY 45",
                  "Social Dance",
                  "Step basic 45",
                  "FT (Functional Training) 45",
                  "Pilates Mat 45",
                  "Zumba 45",
                ].map((title) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[#9D50BB] transition hover:border-[#9D50BB]/40 hover:bg-white/10"
                  >
                    {title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-2xl font-semibold">Тренеры</h2>
          <div className="mt-6 flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="shrink-0">
                <div className="h-56 w-52 overflow-hidden rounded-3xl bg-[#f2d7a1] shadow-sm">
                  <div className="h-full w-full bg-gradient-to-br from-[#f4d6a0] via-[#f6deb5] to-[#eec786]" />
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-100">
                  {trainer.name}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-2xl font-semibold">Контакты</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0A0B10]/60 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#9D50BB]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <path
                      d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="12"
                      cy="10"
                      r="2.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white">Адрес</div>
                  <div> {club.address}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0A0B10]/60 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#9D50BB]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <path
                      d="M6.6 3.3 7.3 2.7a2 2 0 0 1 2.8 0l2.6 2.6a2 2 0 0 1 0 2.8l-1.6 1.6a1 1 0 0 0-.2 1.1c1.1 2.2 2.9 4 5.1 5.1a1 1 0 0 0 1.1-.2l1.6-1.6a2 2 0 0 1 2.8 0l2.6 2.6a2 2 0 0 1 0 2.8l-.7.7c-2 2-5.3 2.2-7.5.5l-1.2-.9a19.7 19.7 0 0 1-4.6-4.6l-.9-1.2c-1.7-2.2-1.5-5.5.5-7.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white">Телефон</div>
                  <div className="text-white">+7 (495) 255-50-00</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0A0B10]/60 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#9D50BB]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M12 7v5l3 2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white">Режим работы</div>
                  <div>Ежедневно с 6 до 24</div>
                  <div>Работа ресепшен с 10 до 22</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="rounded-full border border-[#9D50BB]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-[#9D50BB] transition hover:bg-[#9D50BB]/15">
                  Проложить маршрут
                </button>
                <button className="rounded-full bg-[#9D50BB] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_18px_rgba(157,80,187,0.45)] transition hover:shadow-[0_0_26px_rgba(157,80,187,0.6)]">
                  Позвонить
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1f2330] via-[#0f1118] to-[#2d2550] p-4">
              <div className="flex h-full min-h-[260px] items-center justify-center rounded-2xl border border-white/10 bg-[#0A0B10]/40 text-sm text-slate-400">
                Карта (заглушка)
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <h2 className="text-2xl font-semibold">Остались вопросы?</h2>
          <p className="mt-2 text-slate-300">
            Оставьте заявку — мы перезвоним и расскажем подробнее.
          </p>
          <form className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Имя
              <input
                type="text"
                name="name"
                placeholder="Ваше имя"
                className="rounded-xl border border-white/10 bg-[#0A0B10]/60 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#9D50BB]/60"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Телефон
              <input
                type="tel"
                name="phone"
                placeholder="+7 (___) ___-__-__"
                className="rounded-xl border border-white/10 bg-[#0A0B10]/60 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#9D50BB]/60"
              />
            </label>
            <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-300">
              Сообщение
              <textarea
                name="message"
                rows={4}
                placeholder="Мы с вами свяжемся"
                className="resize-none rounded-xl border border-white/10 bg-[#0A0B10]/60 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#9D50BB]/60"
              />
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-[#9D50BB] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_18px_rgba(157,80,187,0.45)] transition hover:shadow-[0_0_26px_rgba(157,80,187,0.6)]"
              >
                Оставить заявку
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default ClubPage;
