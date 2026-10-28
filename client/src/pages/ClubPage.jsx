import { useState } from "react";
import { useParams } from "react-router-dom";

import { clubsApi } from "../api/clubs";
import { workoutsApi } from "../api/workouts";
import ClubSchedule from "../components/ClubSchedule";
import Header from "../components/Header";
import QueryState from "../components/QueryState";
import { trainersByClub } from "../components/trainers";
import { useApiQuery } from "../hooks/useApiQuery";
import {
  GroupTraining,
  Parking,
  SpaZone,
  TwoStory,
  WorkHours,
} from "../assets/Icons/Icons";

// Фотографий по клубам в API нет, поэтому галерея общая для всей сети.
const GALLERY = [
  { id: 1, label: "Тренажёрный зал", src: "/aviapark_1.png" },
  { id: 2, label: "Зона свободных весов", src: "/aviapark_2.jpg" },
  { id: 3, label: "Кардио-зона", src: "/aviapark_3.jpg" },
];

/** Инициалы для аватара-заглушки тренера: фото в данных нет. */
function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/** Яндекс.Карты по адресу — виджет и маршрут не требуют ключа. */
function mapUrl(address) {
  return `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(address)}&z=16`;
}

function routeUrl(address) {
  return `https://yandex.ru/maps/?rtext=~${encodeURIComponent(address)}&rtt=auto`;
}

function featuresFor(club) {
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
    features.push(
      {
        key: "twostory",
        title: "Двухэтажный зал",
        description: "Больше пространства для тренировок.",
        icon: <TwoStory className="h-6 w-6 text-amber-200" />,
      },
      {
        key: "modern",
        title: "Современное оборудование",
        description: "Новые тренажеры и свободные веса.",
        icon: <GroupTraining className="h-6 w-6 text-indigo-200" />,
      },
    );
  }

  return features;
}

function ClubPageLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0A0B10] text-slate-100">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-12 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

function ClubPage() {
  const { id } = useParams();
  const [photoIndex, setPhotoIndex] = useState(0);

  const clubQuery = useApiQuery((signal) => clubsApi.retrieve(id, { signal }), [id]);
  const workoutTypesQuery = useApiQuery((signal) => workoutsApi.types({ signal }), []);

  const club = clubQuery.data;

  if (clubQuery.loading || clubQuery.error || !club) {
    return (
      <ClubPageLayout>
        <QueryState
          loading={clubQuery.loading}
          error={clubQuery.error}
          isEmpty={!club}
          emptyText="Клуб не найден. Проверьте ссылку или выберите клуб из меню."
          onRetry={clubQuery.reload}
        >
          {null}
        </QueryState>
      </ClubPageLayout>
    );
  }

  const photos = GALLERY;
  const features = featuresFor(club);
  const trainers = trainersByClub[club.id] || trainersByClub.default;
  const workoutTypes = workoutTypesQuery.data || [];

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
                <img
                  src={photos[photoIndex].src}
                  alt={`${photos[photoIndex].label} — ${club.name}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-4 left-4 rounded-full bg-[#0A0B10]/70 px-3 py-1.5 text-xs text-slate-200 backdrop-blur">
                  {photos[photoIndex].label}
                </div>
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
            <ClubSchedule clubId={club.id} />

            <div className="rounded-3xl border border-white/10 bg-[#0A0B10]/60 p-6">
              <h2 className="text-2xl font-semibold">Групповые тренировки</h2>
              <QueryState
                loading={workoutTypesQuery.loading}
                error={workoutTypesQuery.error}
                isEmpty={workoutTypes.length === 0}
                emptyText="Направления пока не добавлены."
                onRetry={workoutTypesQuery.reload}
              >
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {workoutTypes.map((type) => (
                    <div
                      key={type.id}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[#9D50BB] transition hover:border-[#9D50BB]/40 hover:bg-white/10"
                      title={type.description}
                    >
                      {type.title}
                      <span className="ml-1 text-xs font-normal text-slate-400">
                        {type.default_duration} мин
                      </span>
                    </div>
                  ))}
                </div>
              </QueryState>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-2xl font-semibold">Тренеры</h2>
          <div className="mt-6 flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="w-52 shrink-0">
                <div className="flex h-56 w-52 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#f4d6a0] via-[#f6deb5] to-[#eec786] shadow-sm">
                  <span className="text-5xl font-black text-[#8a6a2f]/70">
                    {initials(trainer.name)}
                  </span>
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-100">
                  {trainer.name}
                </div>
                <div className="text-xs text-slate-400">{trainer.role}</div>
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
                  <div className="text-white">{club.phone}</div>
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
                  <div>{club.timezone}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={routeUrl(club.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[#9D50BB]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-[#9D50BB] transition hover:bg-[#9D50BB]/15"
                >
                  Проложить маршрут
                </a>
                <a
                  href={`tel:${club.phone.replace(/[^+\d]/g, "")}`}
                  className="rounded-full bg-[#9D50BB] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_18px_rgba(157,80,187,0.45)] transition hover:shadow-[0_0_26px_rgba(157,80,187,0.6)]"
                >
                  Позвонить
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1f2330] via-[#0f1118] to-[#2d2550] p-4">
              <iframe
                title={`Карта: ${club.name}`}
                src={mapUrl(club.address)}
                loading="lazy"
                className="h-full min-h-[260px] w-full rounded-2xl border border-white/10"
              />
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
