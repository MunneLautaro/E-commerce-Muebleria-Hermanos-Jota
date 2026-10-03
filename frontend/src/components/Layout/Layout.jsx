import { Link, Outlet } from "react-router-dom"
import { layoutStyles as s } from "./LayoutStyles"

export const Layout = () => (
  <div className={s.root}>
    <header className={s.header}>
      <Link className={s.marca} to="/">
        Hermanos Jota
      </Link>
      <nav className={s.nav} aria-label="Principal">
        <Link className={s.enlace} to="/">
          Inicio
        </Link>
        <Link className={s.enlace} to="/contacto">
          Contacto
        </Link>
      </nav>
    </header>
    <main className={s.main}>
      <Outlet />
    </main>
  </div>
)
