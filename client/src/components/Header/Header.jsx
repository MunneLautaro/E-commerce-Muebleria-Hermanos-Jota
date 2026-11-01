import { useEffect, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { Menu, ShoppingCart, UserRound, X } from "lucide-react"
import { CartDrawer, useCart } from "../../features/cart"
import { useAuth } from "../../features/auth"
import { headerStyles as s } from "./HeaderStyles"
import logo from "../../assets/logo.svg"

const navLinks = [
  { to: "/", label: "Inicio" },
  { to: "/productos", label: "Productos" },
  { to: "/contact", label: "Contacto" },
]

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { itemCount } = useCart()
  const { user, isAuthenticated, logout } = useAuth()

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
    <>
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

            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className={desktopLinkClass}
              >
                Admin
              </NavLink>
            )}

            <button
              type="button"
              aria-label="Abrir carrito de compras"
              className={s.cartButton}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart
                className={s.cartIcon}
                aria-hidden="true"
              />

              {itemCount > 0 && (
                <span className={s.cartBadge}>{itemCount}</span>
              )}
            </button>
          </nav>

          <div className={s.actions}>
            {isAuthenticated ? (
              <>
                <span className={s.userBadge} title={user?.email}>
                  <UserRound
                    className={s.userIcon}
                    aria-hidden="true"
                  />
                  <span className="truncate">{user?.email}</span>
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className={s.buttonLogout}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={s.buttonSecondary}>
                  Ingresar
                </Link>
                <Link to="/register" className={s.buttonPrimary}>
                  Registrarse
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className={s.menuButton}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? (
              <X className={s.menuIcon} aria-hidden="true" />
            ) : (
              <Menu className={s.menuIcon} aria-hidden="true" />
            )}
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

              {user?.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={mobileLinkClass}
                  onClick={closeMenu}
                >
                  Admin
                </NavLink>
              )}

              <button
                type="button"
                className={s.mobileCartButton}
                onClick={() => {
                  setCartOpen(true)
                  closeMenu()
                }}
              >
                <span>Carrito</span>
                {itemCount > 0 && (
                  <span className={s.mobileCartBadge}>{itemCount}</span>
                )}
              </button>

              <div className={s.mobileActions}>
                {isAuthenticated ? (
                  <>
                    <div className={s.mobileUserInfo}>
                      <UserRound
                        className={s.userIcon}
                        aria-hidden="true"
                      />
                      <span className="truncate">{user?.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logout()
                        closeMenu()
                      }}
                      className={s.buttonLogout}
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
