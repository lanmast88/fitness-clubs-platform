import Header from "../components/Header";

const faqItems = [
  {
    question: "Как оформить клубную карту?",
    answer:
      "Оставьте заявку на сайте или в приложении. Мы перезвоним, подберем тариф и поможем оформить карту.",
  },
  {
    question: "Можно ли приостановить абонемент?",
    answer:
      "Да, для большинства тарифов доступна заморозка. Количество дней зависит от выбранного плана.",
  },
  {
    question: "Есть ли пробная тренировка?",
    answer:
      "Да, мы можем организовать пробный визит, чтобы вы познакомились с клубом и тренерами.",
  },
  {
    question: "Как работает доступ в клуб?",
    answer:
      "Доступ осуществляется по браслету. После оплаты и оформления карты вы получите браслет на ресепшене.",
  },
  {
    question: "Можно ли ходить в разные клубы?",
    answer:
      "Да, для некоторых тарифов открыт доступ ко всем клубам сети. Уточните условия у менеджера.",
  },
  {
    question: "Что входит в групповые тренировки?",
    answer:
      "В расписании есть силовые, функциональные и восстановительные классы. Запись открывается за сутки.",
  },
];

function FAQPage() {
  return (
    <div className="min-h-screen bg-[#0A0B10] text-slate-100">
      <Header />
      <main className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
            FAQ
          </p>
          <h1 className="mt-2 text-4xl font-bold">Частые вопросы</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            Собрали ответы на самые популярные вопросы о клубах, тарифах и
            тренировках.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold">
                {item.question}
                <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition group-open:rotate-45 group-open:text-white">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate-300">{item.answer}</p>
            </details>
          ))}
        </div>
      </main>
    </div>
  );
}

export default FAQPage;
