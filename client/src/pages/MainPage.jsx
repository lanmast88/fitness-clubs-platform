import { useRef } from "react";
import logo from "../../public/logo.png";
import { clubs } from "../components/clubs";
import { promoes } from "../components/promo";
import { memberships } from "../components/memberships";
import MembershipCard from "../components/MembershipCard";

const navLinks = ["Клубы", "Тарифы", "Акции", "Новости", "Групповые", "FAQ"];

const halls = [
  {
    title: "Силовая зона",
    text: "Современные тренажеры, свободные веса и простор для функционального тренинга.",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Групповые студии",
    text: "Йога, пилатес, сайкл, HIIT и танцевальные направления с сертифицированными тренерами.",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Восстановление",
    text: "Сауна, массажные кабинеты и зона релакса для полноценного отдыха после тренировки.",
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
  },
];

function MainPage() {
  const tariffsSliderRef = useRef(null);

  const slideTariffs = (direction) => {
    if (!tariffsSliderRef.current) return;
    tariffsSliderRef.current.scrollBy({
      left: direction * 360,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Логотип фитнес клуба"
              className="h-15 w-20 rounded-lg object-cover"
            />
            <span className="text-lg font-semibold tracking-wide">
              Stack Fitness
            </span>
          </a>

          <ul className="hidden items-center gap-6 text-sm font-medium text-slate-200 md:flex">
            {navLinks.map((link) => (
              <li key={link}>
                <a href="#" className="transition hover:text-cyan-300">
                  {link}
                </a>
              </li>
            ))}
          </ul>

          <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300">
            Записаться
          </button>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {promoes.map((slide) => (
              <article
                key={slide.title}
                className="group relative min-h-72 overflow-hidden rounded-2xl border border-white/10"
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                    Акция
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">{slide.title}</h2>
                  <p className="mt-1 text-sm font-semibold text-cyan-200">
                    {slide.subtitle}
                  </p>
                  <p className="mt-3 text-sm text-slate-200">{slide.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
          id="tariffs"
        >
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                Тарифы
              </p>
              <h3 className="mt-2 text-3xl font-bold">Выбери свою карту</h3>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => slideTariffs(-1)}
                className="h-10 w-10 rounded-full border border-white/20 bg-white/5 text-slate-100 transition hover:bg-white/10"
                aria-label="Прокрутить тарифы влево"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => slideTariffs(1)}
                className="h-10 w-10 rounded-full border border-white/20 bg-white/5 text-slate-100 transition hover:bg-white/10"
                aria-label="Прокрутить тарифы вправо"
              >
                →
              </button>
            </div>
          </div>

          <div
            ref={tariffsSliderRef}
            className="flex items-stretch gap-6 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {memberships.map((plan) => (
              <div key={plan.id} className="snap-center shrink-0">
                <MembershipCard plan={plan} />
              </div>
            ))}
          </div>
        </section>

        <section
          className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
          id="halls"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
            Наши залы
          </p>
          <h3 className="mt-2 text-3xl font-bold">
            Пространство для прогресса и комфорта
          </h3>
          <p className="mt-4 max-w-2xl text-slate-300">
            Мы объединили современное оборудование, опытных тренеров и удобную
            инфраструктуру, чтобы каждая тренировка была результативной и
            безопасной.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {halls.map((hall) => (
              <article
                key={hall.title}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <img
                  src={hall.image}
                  alt={hall.title}
                  className="h-52 w-full object-cover"
                />
                <div className="p-5">
                  <h4 className="text-xl font-semibold">{hall.title}</h4>
                  <p className="mt-2 text-sm text-slate-300">{hall.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-900/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 Fitness Clubs. Сеть фитнес-клубов для учебного проекта.</p>
          <div className="flex gap-4">
            <a href="#" className="transition hover:text-cyan-300">
              Политика
            </a>
            <a href="#" className="transition hover:text-cyan-300">
              Контакты
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainPage;
