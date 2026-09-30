import { useEffect, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { headerStyles as s } from "./HeaderStyles"
import logo from "../../assets/logo.svg"

const navLinks = [
  { to: "/", label: "Inicio" },
  { to: "/productos", label: "Productos" },
]

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const desktopLinkClass = ({ isActive }) =>
    `${s.link.base} ${isActive ? s.link.active : s.link.inactive}`

  const mobileLinkClass = ({ isActive }) =>
    `${s.mobileLink.base} ${isActive ? s.mobileLink.active : s.mobileLink.inactive}`

  return (
    <header className={`${s.root} ${scrolled ? s.rootScrolled : ""}`}>
      <div className={s.inner}>
        <Link
          to="/"
          className={s.brand}
          onClick={closeMenu}
          aria-label="Hermanos Jota, ir al inicio"
        >
          <span className={s.logoMark} aria-hidden="true">
            <img src={logo} alt="Hermanos Jota" className={s.logo} />
          </span>
          <span className={s.brandName}>Hermanos Jota</span>
        </Link>

        <nav className={s.nav} aria-label="Principal">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={desktopLinkClass}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={s.actions}>
          <Link to="/login" className={s.buttonSecondary}>
            Ingresar
          </Link>
          <Link to="/register" className={s.buttonPrimary}>
            Registrarse
          </Link>
        </div>

        <button
          type="button"
          className={s.menuButton}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="menu-movil"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <svg
            className={s.menuIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div id="menu-movil" className={s.mobilePanel}>
          <nav className={s.mobileInner} aria-label="Principal móvil">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={mobileLinkClass}
                onClick={closeMenu}
              >
                {label}
              </NavLink>
            ))}
            <div className={s.mobileActions}>
              <Link
                to="/login"
                className={s.buttonSecondary}
                onClick={closeMenu}
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className={s.buttonPrimary}
                onClick={closeMenu}
              >
                Registrarse
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
