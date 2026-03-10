import React, { useState } from "react";

const memberships = [
  {
    id: 1,
    title: "Light",
    scope: "Ограниченный доступ",
    price: 1700,
    duration_months: 1,
    features: [
      { text: "Доступ в один выбранный клуб", enabled: true, info: false },
      { text: "Тренажерный зал и кардио-зона", enabled: true, info: false },
      { text: "Посещение с 07:00 до 17:00", enabled: true, info: false },
      { text: "Заморозка до 7 дней", enabled: true, info: false },
      { text: "Групповые занятия", enabled: false, info: false },
      { text: "Доступ 24/7", enabled: false, info: false },
      { text: "Гостевой доступ", enabled: false, info: false },
      { text: "SPA-зона", enabled: false, info: false },
    ],
    popular: false,
  },
  {
    id: 2,
    title: "Infinity",
    scope: "Безлимит везде",
    price: 2800,
    duration_months: 1,
    features: [
      { text: "Безлимитный доступ во все клубы", enabled: true, info: false },
      { text: "Ознакомительная тренировка", enabled: true, info: false },
      { text: "Анализ состава тела InBody", enabled: true, info: false },
      { text: "Smart Start тренировки", enabled: true, info: true },
      { text: "50+ групповых тренировок", enabled: true, info: false },
      { text: "Гостевой доступ для друзей", enabled: true, info: true },
      { text: "Семейный доступ", enabled: true, info: true },
      { text: "SPA-зона", enabled: true, info: true },
      { text: "Онлайн тренировки Action", enabled: false, info: false },
    ],
    popular: true,
  },
  {
    id: 3,
    title: "Premium",
    scope: "Все включено",
    price: 5500,
    duration_months: 1,
    features: [
      { text: "Все преимущества Infinity", enabled: true, info: false },
      { text: "Аренда личного шкафчика", enabled: true, info: false },
      { text: "Стирка спортивной формы", enabled: true, info: false },
      { text: "2 гостевых визита в месяц", enabled: true, info: false },
      { text: "Персональный тренер (2 занятия)", enabled: true, info: true },
      { text: "Массаж (1 сеанс)", enabled: true, info: true },
      { text: "Приоритетная поддержка", enabled: true, info: false },
      { text: "Закрытые мероприятия", enabled: true, info: false },
    ],
    popular: false,
  },
  {
    id: 4,
    title: "Student",
    scope: "Для учащихся",
    price: 2100,
    duration_months: 1,
    features: [
      { text: "Доступ 24/7 в один клуб", enabled: true, info: false },
      { text: "Групповые занятия включены", enabled: true, info: false },
      { text: "Спецпредложения от партнеров", enabled: true, info: false },
      { text: "Требуется студенческий билет", enabled: true, info: true },
      { text: "Заморозка до 14 дней", enabled: true, info: false },
      { text: "Доступ во все клубы", enabled: false, info: false },
      { text: "Гостевой доступ", enabled: false, info: false },
      { text: "SPA-зона", enabled: false, info: false },
    ],
    popular: false,
  },
];

const CheckIcon = () => (
  <svg
    className="w-4 h-4 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const MinusIcon = () => (
  <svg
    className="w-4 h-4 text-slate-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M20 12H4"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    className="w-4 h-4 text-slate-300 cursor-help"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

const MembershipCard = ({ plan }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative bg-white rounded-3xl p-6 transition-all duration-300 shadow-lg
        ${
          plan.popular
            ? "ring-2 ring-purple-500 shadow-purple-500/20 scale-105 z-10"
            : "hover:shadow-xl hover:-translate-y-1"
        }
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ minWidth: "320px", maxWidth: "360px" }}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
          Популярный выбор
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{plan.title}</h3>
          <p className="text-slate-500 text-sm font-medium mt-0.5">
            {plan.scope}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-slate-900">
            {plan.price.toLocaleString("ru-RU")}
          </span>
          <span className="text-slate-600 text-sm font-medium"> ₽/мес</span>
        </div>
      </div>

      {/* Wristband Image */}
      <div className="absolute top-4 right-4 w-16 h-16 opacity-80 pointer-events-none">
        <img
          src="https://image.qwenlm.ai/public_source/6fb481b9-920f-4bce-9668-8f692d404080/1ca55cc9b-25ba-4168-81be-d3be503499a0.png"
          alt="Браслет"
          className="w-full h-full object-contain transform rotate-12"
        />
      </div>

      {/* Features List */}
      <div className="space-y-3 mb-6 mt-8">
        {plan.features.map((feature, idx) => (
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

      {/* Buy Button */}
      <button
        className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-base transition-all duration-200 transform active:scale-98
          ${
            plan.popular
              ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30"
              : "bg-slate-100 hover:bg-slate-200 text-slate-800"
          }
        `}
      >
        Купить
      </button>
    </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-purple-600 font-semibold tracking-wide uppercase text-sm mb-3">
            Клубные карты
          </h2>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Выберите свой тариф
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Гибкие условия для любых целей. От базовых тренировок до
            премиального сервиса.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
          {memberships.map((plan) => (
            <MembershipCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  );
}
