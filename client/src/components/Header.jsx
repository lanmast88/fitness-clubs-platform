import { NavLink } from "react-router-dom";
import logo from "../../public/logo.png";
import { clubs } from "./clubs";
import RegistrationForm from "../pages/RegistrationForm";

const navLinks = [
  { name: "Клубы", linkTo: "/clubs" },
  { name: "Тарифы", linkTo: "/tariffs" },
  { name: "Акции", linkTo: "/promotions" },
  { name: "Новости", linkTo: "/news" },
  { name: "Групповые", linkTo: "/clubs" },
  { name: "FAQ", linkTo: "/faq" },
];
function Header() {
  const scrollToTop = () =>
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A0B10]/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-none items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          className="flex items-center gap-3"
          onClick={scrollToTop}
        >
          <img
            src={logo}
            alt="Логотип фитнес клуба"
            className="h-15 w-20 rounded-lg object-cover"
          />
          <span className="text-lg font-semibold tracking-wide">
            Stack Fitness
          </span>
        </NavLink>

        <ul className="hidden items-center gap-6 text-sm font-medium text-slate-200 md:flex">
          <li className="relative group">
            <button
              type="button"
              className="transition hover:text-[#9D50BB]"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Клубы
            </button>
            <div className="absolute left-0 top-full mt-1 hidden w-80 rounded-2xl border border-white/10 bg-[#0A0B10]/95 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur group-hover:block group-focus-within:block">
              <div className="absolute -top-2 left-0 h-2 w-full" />
              {clubs.map((club) => (
                <a
                  key={club.id}
                  href={`/clubs/${club.id}`}
                  className="block rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-[#9D50BB]/15 hover:text-[#9D50BB]"
                >
                  <div className="font-semibold">{club.name}</div>
                  <div className="text-xs text-slate-400">{club.address}</div>
                </a>
              ))}
            </div>
          </li>
          {navLinks
            .filter((link) => link.name !== "Клубы")
            .map((link) => (
              <NavLink
                key={link.linkTo}
                to={link.linkTo}
                onClick={scrollToTop}
                className="transition hover:text-[#9D50BB]"
              >
                {link.name}
              </NavLink>
            ))}
        </ul>
        <NavLink
          to="/registration"
          onClick={scrollToTop}
          className="rounded-full bg-[#9D50BB] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_18px_rgba(157,80,187,0.45)] transition hover:shadow-[0_0_26px_rgba(157,80,187,0.6)]"
        >
          Записаться
        </NavLink>
      </nav>
    </header>
  );
}
export default Header;
