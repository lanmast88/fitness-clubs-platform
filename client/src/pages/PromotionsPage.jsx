import Header from "../components/Header";
import { promoes } from "../components/promo";

function PromotionsPage() {
  return (
    <div className="min-h-screen bg-[#0A0B10] text-slate-100">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
            Акции
          </p>
          <h1 className="mt-2 text-4xl font-bold">Специальные предложения</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            Выберите акцию и оставьте заявку — мы свяжемся и подберем оптимальные
            условия.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {promoes.map((promo) => (
            <article
              key={promo.title}
              className="group relative h-[420px] overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur"
            >
              <img
                src={promo.image}
                alt={promo.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0B10]/80 via-[#0A0B10]/35 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-7">
                <div className="max-w-[420px] rounded-2xl bg-white/10 p-6 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                    Акция
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    {promo.title}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-cyan-200">
                    {promo.subtitle}
                  </p>
                  <p className="mt-3 text-sm text-slate-200">{promo.text}</p>
                  <button className="mt-5 inline-flex items-center rounded-full bg-[#9D50BB] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_18px_rgba(157,80,187,0.45)] transition hover:shadow-[0_0_26px_rgba(157,80,187,0.6)]">
                    Оставить заявку
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default PromotionsPage;
