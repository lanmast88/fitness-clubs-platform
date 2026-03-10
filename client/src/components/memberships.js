const memberships = [
  {
    id: 1,
    title: "Light",
    scope: "Ограниченный доступ",
    price: 1700,
    duration_months: 1,
    image: "/light.png",
    features: [
      "Доступ в один выбранный клуб",
      "Тренажерный зал и кардио-зона",
      "Посещение с 07:00 до 17:00",
      "Заморозка до 7 дней",
    ],
  },
  {
    id: 2,
    title: "Infinity",
    scope: "Безлимит везде",
    price: 2900,
    duration_months: 1,
    image: "/infinity.png",
    features: [
      "Доступ 24/7 во все клубы сети",
      "Все групповые занятия",
      "Анализ состава тела InBody",
      "Заморозка до 30 дней",
    ],
  },
  {
    id: 3,
    title: "Premium",
    scope: "Все включено",
    price: 5500,
    duration_months: 1,
    image: "/premium.png",
    features: [
      "Все преимущества Infinity",
      "Аренда личного шкафчика",
      "Стирка спортивной формы",
      "2 гостевых визита в месяц",
    ],
  },
  {
    id: 4,
    title: "Student",
    scope: "Для учащихся",
    price: 2100,
    duration_months: 1,
    image: "/student.png",
    features: [
      "Доступ 24/7 в один клуб",
      "Групповые занятия включены",
      "Спецпредложения от партнеров",
      "Требуется студенческий билет",
    ],
  },
];

export { memberships };
/*export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

        <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
          {memberships.map((plan) => (
            <MembershipCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  );
}*/
