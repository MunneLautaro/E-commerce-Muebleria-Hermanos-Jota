import { Outlet } from "react-router-dom"
import { Header } from "../Header/Header"
import { Footer } from "../Footer/Footer"
import { layoutStyles as s } from "./LayoutStyles"

export const Layout = () => (
  <div className={s.root}>
    <a href="#contenido" className={s.skipLink}>
      Saltar al contenido
    </a>
    <Header />
    <main id="contenido" className={s.main}>
      <Outlet />
    </main>
    <Footer />
  </div>
)
