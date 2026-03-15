import { memberships } from "./memberships";
import MembershipCard from "../components/MembershipCard";
import { useRef } from "react";

function MembershipSlide({ embedded = false }) {
  const tariffsSliderRef = useRef(null);
  const slideTariffs = (direction) => {
    if (!tariffsSliderRef.current) return;
    tariffsSliderRef.current.scrollBy({
      left: direction * 360,
      behavior: "smooth",
    });
  };
  return (
    <section
      className={
        embedded ? "py-12" : "mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
      }
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
            className="h-10 w-10 rounded-full border border-[#9D50BB]/40 bg-white/5 text-slate-100 shadow-[0_0_12px_rgba(157,80,187,0.35)] transition hover:bg-white/10"
            aria-label="Прокрутить тарифы влево"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => slideTariffs(1)}
            className="h-10 w-10 rounded-full border border-[#9D50BB]/40 bg-white/5 text-slate-100 shadow-[0_0_12px_rgba(157,80,187,0.35)] transition hover:bg-white/10"
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
  );
}

export default MembershipSlide;
