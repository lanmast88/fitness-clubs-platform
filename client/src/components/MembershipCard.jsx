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

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden bg-white rounded-3xl p-6 transition-all duration-300 shadow-lg
        ${
          plan.popular
            ? "ring-2 ring-purple-500 shadow-purple-500/20 scale-105 z-10"
            : "hover:shadow-xl"
        }
      `}
      style={{ minWidth: "320px", maxWidth: "360px" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100/60 via-slate-50 to-indigo-100/70" />

      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
          Популярный выбор
        </div>
      )}

      <div className="relative z-10 flex justify-between items-start mb-6 pr-24">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{plan.title}</h3>
          <p className="text-slate-500 text-sm font-medium mt-0.5">
            {plan.scope}
          </p>
        </div>
        <div className="rounded-xl bg-white/80 backdrop-blur px-3 py-2 shadow-sm whitespace-nowrap">
          <span className="text-3xl font-bold text-slate-900 leading-none">
            {plan.price.toLocaleString("ru-RU")}
          </span>
          <span className="text-slate-600 text-sm font-semibold ml-1">
            ₽/{plan.duration_months ? `мес` : "мес"}
          </span>
        </div>
      </div>

      <div className="absolute right-2 top-9 z-20 w-32 h-24 pointer-events-none">
        <div className="absolute inset-0 rounded-full bg-indigo-300/30 blur-xl" />
        <img
          src={plan.image}
          alt={`Браслет тарифа ${plan.title}`}
          className="relative w-full h-full object-contain -rotate-[18deg] translate-x-1 drop-shadow-[0_12px_16px_rgba(49,46,129,0.35)]"
        />
      </div>

      <div className="relative z-10 flex-1 space-y-3 mb-6 mt-6 rounded-3xl bg-white/90 p-5">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${!feature.enabled ? "opacity-40" : ""}`}
          >
            <div
              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5
              ${feature.enabled ? "bg-purple-600" : "bg-slate-300"}
            `}
            >
              {feature.enabled ? <CheckIcon /> : <MinusIcon />}
            </div>
            <span
              className={`text-sm ${feature.enabled ? "text-slate-800" : "text-slate-400"} flex-1`}
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
        className={`relative isolate w-full py-3.5 px-6 rounded-2xl font-semibold text-base tracking-wide transition-all duration-200 active:scale-[0.98] border
          ${
            plan.popular
              ? "text-white border-indigo-500/60 bg-gradient-to-r from-fuchsia-700 via-indigo-700 to-cyan-700 shadow-[0_10px_24px_rgba(79,70,229,0.38)] hover:brightness-110 hover:-translate-y-0.5"
              : "text-white border-slate-700/30 bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-900 shadow-[0_8px_20px_rgba(15,23,42,0.35)] hover:shadow-[0_12px_24px_rgba(15,23,42,0.45)] hover:-translate-y-0.5"
          }
        `}
      >
        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/20" />
        Купить
      </button>
    </div>
  );
};

export default MembershipCard;
