import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import Header from "../components/Header";
import { useApiMutation } from "../hooks/useApiMutation";
import { useAuth } from "../hooks/useAuth";

const logo = "/logo.png";

const inputClass =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#9D50BB] focus:outline-none focus:ring-2 focus:ring-[#9D50BB]/30";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const signIn = useApiMutation(login);

  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const redirectTo = location.state?.from || "/account";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const { [name]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!formValues.email.trim()) nextErrors.email = "Введите почту.";
    if (!formValues.password) nextErrors.password = "Введите пароль.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await signIn.run({ email: formValues.email.trim(), password: formValues.password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrors(error.fieldErrors || {});
    }
  };

  // SimpleJWT отвечает на неверную пару англоязычным текстом — подменяем своим.
  const errorMessage =
    signIn.error?.status === 401 ? "Неверная почта или пароль." : signIn.error?.message;

  if (isAuthenticated && !signIn.loading) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <section className="min-h-screen bg-[#0A0B10] text-slate-100">
      <Header />

      <div className="relative mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-16">
        <div className="pointer-events-none absolute -top-10 right-0 h-56 w-56 rounded-full bg-[#9D50BB]/25 blur-[90px]" />

        <div className="relative z-10 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-slate-300">
          <img src={logo} alt="Логотип фитнес клуба" className="h-6 w-6 rounded-full object-cover" />
          Stack Fitness
        </div>

        <h1 className="relative z-10 text-3xl font-semibold text-white sm:text-4xl">Вход</h1>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="relative z-10 flex w-full flex-col gap-5 rounded-[27px] border border-white/10 bg-[#0F1118]/80 p-6 text-left"
        >
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Почта
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={formValues.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
              placeholder="test@gmail.com"
              className={inputClass}
            />
            {errors.email && <span className="text-xs text-rose-300">{errors.email}</span>}
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Пароль
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={formValues.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
              placeholder="********"
              className={inputClass}
            />
            {errors.password && <span className="text-xs text-rose-300">{errors.password}</span>}
          </label>

          {signIn.error && Object.keys(signIn.error.fieldErrors || {}).length === 0 && (
            <span className="text-xs text-rose-300">{errorMessage}</span>
          )}

          <button
            type="submit"
            disabled={signIn.loading}
            className="mt-2 cursor-pointer rounded-2xl bg-[#9D50BB] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_22px_rgba(157,80,187,0.5)] transition hover:shadow-[0_0_30px_rgba(157,80,187,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signIn.loading ? "Входим…" : "Войти"}
          </button>

          <div className="text-xs text-slate-400">
            Нет аккаунта?{" "}
            <Link to="/registration" className="text-[#9D50BB] hover:underline">
              Зарегистрироваться
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;
