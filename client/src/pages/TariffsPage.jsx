import Header from "../components/Header";
import MembershipSlide from "../components/MembershipsSlide";

function TariffsPage() {
  return (
    <div className="min-h-screen bg-[#0A0B10] text-slate-100">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-12 sm:px-6 lg:px-8">
        <MembershipSlide embedded />

        <div className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <h2 className="text-2xl font-semibold">Не нашли подходящий тариф?</h2>
          <p className="mt-2 text-slate-300">
            Оставьте контакты — мы свяжемся и подберем лучший вариант.
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
        </div>
      </main>
    </div>
  );
}

export default TariffsPage;
