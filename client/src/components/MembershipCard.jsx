import { CheckIcon, InfoIcon, MinusIcon } from "../assets/Icons/Icons";

const MembershipCard = ({ plan }) => {
  const features = (plan.features || []).map((feature) =>
    typeof feature === "string"
      ? { text: feature, enabled: true, info: false }
      : {
          text: feature.text,
          enabled: feature.enabled !== false,
          info: Boolean(feature.info),
        },
  );
  const accentDotClass =
    plan.title === "Light"
      ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]"
      : plan.title === "Infinity"
        ? "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]"
        : plan.title === "Premium"
          ? "bg-gradient-to-br from-slate-950 via-[#1d1530] to-[#9D50BB] shadow-[0_0_14px_rgba(157,80,187,0.85)] ring-1 ring-white/30"
          : "bg-[#9D50BB] shadow-[0_0_12px_rgba(157,80,187,0.9)]";

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl p-6 transition-all duration-300 shadow-lg backdrop-blur bg-white/10 border border-[#9D50BB]/20
        ${
          plan.popular
            ? "ring-2 ring-[#9D50BB]/60 shadow-[0_0_30px_rgba(157,80,187,0.35)] scale-105 z-10"
            : "hover:shadow-xl"
        }
      `}
      style={{ minWidth: "320px", maxWidth: "360px" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1a1f2e]/40 via-[#0A0B10]/20 to-[#3a5bdc]/20" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[#7cc6ff]/15" />

      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
          Популярный выбор
        </div>
      )}

      <div className="relative z-10 flex items-start justify-between mb-6">
        <div>
          <h3 className="flex items-center gap-2 text-2xl font-bold text-slate-100">
            <span className={`h-2.5 w-2.5 rounded-full ${accentDotClass}`} />
            {plan.title}
          </h3>
          <p className="text-slate-400 text-sm font-medium mt-0.5">
            {plan.scope}
          </p>
          <div className="mt-3 inline-flex items-end rounded-xl bg-white/15 backdrop-blur px-3 py-2 shadow-[0_0_16px_rgba(157,80,187,0.25)] whitespace-nowrap">
            <span className="text-3xl font-bold text-slate-100 leading-none">
              {plan.price.toLocaleString("ru-RU")}
            </span>
            <span className="text-slate-300 text-sm font-semibold ml-1">
              ₽/{plan.duration_months ? `мес` : "мес"}
            </span>
          </div>
        </div>
        <div className="relative w-36 h-28 pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-[#9D50BB]/20 blur-[26px]" />
          <img
            src={plan.image}
            alt={`Браслет тарифа ${plan.title}`}
            className="relative w-full h-full object-contain -rotate-[18deg] translate-x-2 drop-shadow-[0_12px_18px_rgba(157,80,187,0.35)]"
          />
        </div>
      </div>

      <div className="relative z-10 flex-1 space-y-3 mb-6 mt-6 rounded-3xl bg-white/10 border border-[#7cc6ff]/20 p-5 shadow-[inset_0_0_30px_rgba(124,198,255,0.12)]">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${!feature.enabled ? "opacity-40" : ""}`}
          >
            <div
              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5
              ${feature.enabled ? "bg-[#9D50BB] shadow-[0_0_12px_rgba(157,80,187,0.6)]" : "bg-slate-500"}
            `}
            >
              {feature.enabled ? <CheckIcon /> : <MinusIcon />}
            </div>
            <span
              className={`text-sm ${feature.enabled ? "text-slate-100" : "text-slate-400"} flex-1`}
            >
              {feature.text}
            </span>
            {feature.info && (
              <div className="flex-shrink-0 mt-0.5">
                <InfoIcon />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        className="relative isolate w-full py-3.5 px-6 rounded-2xl font-semibold text-base tracking-wide text-white transition-all duration-200 active:scale-[0.98] border border-[#9D50BB]/60 bg-gradient-to-r from-[#7C35A1] via-[#9D50BB] to-[#5F58D7] shadow-[0_10px_26px_rgba(157,80,187,0.45)] hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(157,80,187,0.6)]"
      >
        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/20" />
        Купить
      </button>
    </div>
  );
};

export default MembershipCard;
