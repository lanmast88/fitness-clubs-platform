import { useState } from "react";
import logo from "../../public/logo.png";
import Header from "../components/Header";

const RegistrationForm = () => {
  const [formValues, setFormValues] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    consent: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }
      const { [name]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const validate = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10,15}$/;

    if (!formValues.email.trim()) {
      nextErrors.email = "Введите почту.";
    } else if (!emailPattern.test(formValues.email)) {
      nextErrors.email = "Некорректный формат почты.";
    }

    if (formValues.phone.trim()) {
      const digitsOnly = formValues.phone.replace(/\D/g, "");
      if (!phonePattern.test(digitsOnly)) {
        nextErrors.phone = "Некорректный номер телефона.";
      }
    }

    if (!formValues.password) {
      nextErrors.password = "Введите пароль.";
    } else if (formValues.password.length < 6) {
      nextErrors.password = "Минимум 6 символов.";
    }

    if (!formValues.confirmPassword) {
      nextErrors.confirmPassword = "Повторите пароль.";
    } else if (formValues.confirmPassword !== formValues.password) {
      nextErrors.confirmPassword = "Пароли не совпадают.";
    }

    if (!formValues.consent) {
      nextErrors.consent = "Нужно согласие на обработку данных.";
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
  };

  return (
    <section className="min-h-screen h-full bg-[#0A0B10] text-slate-100">
      <Header />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-[#9D50BB]/30 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-sky-400/20 blur-[140px]" />
      </div>

      <div className="relative mx-auto my-12 flex h-[736px] w-[500px] max-w-none flex-col items-center justify-center gap-6 ">
        <div className="pointer-events-none absolute -top-24 right-6 h-56 w-56 rounded-full bg-[#9D50BB]/25 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-28 left-8 h-64 w-64 rounded-full bg-sky-400/20 blur-[110px]" />
        <div className="relative z-10 flex flex-1 flex-col items-center justify-between gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-slate-300">
              <img
                src={logo}
                alt="Логотип фитнес клуба"
                className="h-6 w-6 rounded-full object-cover"
              />
              Stack Fitness
            </div>
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                Регистрация в клубе
              </h1>
              <p className="text-xs text-slate-400"></p>
            </div>
            <div className="h-px w-16 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="w-full max-w-md rounded-[28px] bg-gradient-to-br from-white/15 via-white/5 to-white/0 p-[1px] shadow-[0_16px_30px_rgba(0,0,0,0.35)]">
              <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-5 rounded-[27px] border border-white/10 bg-[#0F1118]/80 p-6 text-left"
              >
                <div>
                  <div className="text-sm font-semibold text-white">
                    Ваши данные
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Заполните профиль и свяжемся с вами.
                  </div>
                </div>

                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Почта
                  <input
                    type="email"
                    name="email"
                    required
                    value={formValues.email}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.email)}
                    placeholder="test@gmail.com"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#9D50BB] focus:outline-none focus:ring-2 focus:ring-[#9D50BB]/30"
                  />
                  {errors.email && (
                    <span className="text-xs text-rose-300">
                      {errors.email}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <span>Телефон</span>
                    <span className="text-xs text-slate-400">
                      (не обязательно)
                    </span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.phone)}
                    placeholder="+7 (___) ___-__-__"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#9D50BB] focus:outline-none focus:ring-2 focus:ring-[#9D50BB]/30"
                  />
                  {errors.phone && (
                    <span className="text-xs text-rose-300">
                      {errors.phone}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Пароль
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    value={formValues.password}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.password)}
                    placeholder="********"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#9D50BB] focus:outline-none focus:ring-2 focus:ring-[#9D50BB]/30"
                  />
                  {errors.password && (
                    <span className="text-xs text-rose-300">
                      {errors.password}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Подтверждение пароля
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formValues.confirmPassword}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.confirmPassword)}
                    placeholder="********"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#9D50BB] focus:outline-none focus:ring-2 focus:ring-[#9D50BB]/30"
                  />
                  {errors.confirmPassword && (
                    <span className="text-xs text-rose-300">
                      {errors.confirmPassword}
                    </span>
                  )}
                </label>

                <label className="flex items-center gap-3 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formValues.consent}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.consent)}
                    required
                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-[#9D50BB] focus:ring-[#9D50BB]/40"
                  />
                  Я согласен(а) на обработку персональных данных
                </label>
                {errors.consent && (
                  <span className="text-xs text-rose-300">
                    {errors.consent}
                  </span>
                )}

                <button
                  type="submit"
                  className="mt-2 cursor-pointer rounded-2xl bg-[#9D50BB] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_22px_rgba(157,80,187,0.5)] transition hover:shadow-[0_0_30px_rgba(157,80,187,0.7)]"
                >
                  Отправить заявку
                </button>

                <div className="text-xs text-slate-500">
                  Мы не передаем данные третьим лицам.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationForm;
