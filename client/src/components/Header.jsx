import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { clubsApi } from "../api/clubs";
import { useApiQuery } from "../hooks/useApiQuery";
import { useAuth } from "../hooks/useAuth";

const logo = "/logo.png";

const navLinks = [
  { name: "Тарифы", linkTo: "/tariffs" },
  { name: "Акции", linkTo: "/promotions" },
  { name: "Новости", linkTo: "/news" },
  { name: "FAQ", linkTo: "/faq" },
];

const NAV_BASE =
  "relative py-1 transition after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#9D50BB] after:transition-transform after:duration-200";
const NAV_ACTIVE = "text-[#9D50BB] after:scale-x-100";
const NAV_IDLE = "text-slate-200 hover:text-[#9D50BB] after:scale-x-0";

function navClass({ isActive }) {
  return `${NAV_BASE} ${isActive ? NAV_ACTIVE : NAV_IDLE}`;
}

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const clubsQuery = useApiQuery((signal) => clubsApi.list({ signal }), []);
  const clubs = clubsQuery.data || [];

  // Выпадающий список — не NavLink, поэтому активность считаем сами:
  // подсветка нужна на любой странице клуба.
  const clubsActive = location.pathname.startsWith("/clubs");

  const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A0B10]/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-none items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3" onClick={scrollToTop}>
          <img
            src={logo}
            alt="Логотип фитнес клуба"
            className="h-15 w-20 rounded-lg object-cover"
          />
          <span className="text-lg font-semibold tracking-wide">Stack Fitness</span>
        </NavLink>

        <ul className="hidden items-center gap-6 text-sm font-medium md:flex">
          <li className="relative group">
            <button
              type="button"
              className={`${NAV_BASE} ${clubsActive ? NAV_ACTIVE : NAV_IDLE}`}
              aria-haspopup="true"
              aria-expanded="false"
              aria-current={clubsActive ? "page" : undefined}
            >
              Клубы
            </button>
            <div className="absolute left-0 top-full mt-1 hidden w-80 rounded-2xl border border-white/10 bg-[#0A0B10]/95 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur group-hover:block group-focus-within:block">
              <div className="absolute -top-2 left-0 h-2 w-full" />
              {clubs.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-400">
                  {clubsQuery.loading ? "Загружаем клубы…" : "Клубы пока не добавлены."}
                </p>
              )}
              {clubs.map((club) => (
                <NavLink
                  key={club.id}
                  to={`/clubs/${club.id}`}
                  onClick={scrollToTop}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-sm transition ${
                      isActive
                        ? "bg-[#9D50BB]/20 text-[#9D50BB]"
                        : "text-slate-200 hover:bg-[#9D50BB]/15 hover:text-[#9D50BB]"
                    }`
                  }
                >
                  <div className="font-semibold">{club.name}</div>
                  <div className="text-xs text-slate-400">{club.address}</div>
                </NavLink>
              ))}
            </div>
          </li>

          {navLinks.map((link) => (
            <li key={link.linkTo}>
              <NavLink to={link.linkTo} onClick={scrollToTop} className={navClass}>
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <NavLink
              to="/account"
              onClick={scrollToTop}
              title={user?.email}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#9D50BB]/20 text-[#9D50BB]"
                    : "text-slate-200 hover:bg-white/10"
                }`
              }
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9D50BB] text-xs font-bold uppercase text-white">
                {user?.email?.[0]}
              </span>
              Кабинет
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full px-3 py-2 text-sm text-slate-400 transition hover:text-rose-300"
            >
              Выйти
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <NavLink
              to="/login"
              onClick={scrollToTop}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-[#9D50BB]/50 hover:text-[#9D50BB]"
            >
              Войти
            </NavLink>
            <NavLink
              to="/registration"
              onClick={scrollToTop}
              className="rounded-full bg-[#9D50BB] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_18px_rgba(157,80,187,0.45)] transition hover:shadow-[0_0_26px_rgba(157,80,187,0.6)]"
            >
              Регистрация
            </NavLink>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
