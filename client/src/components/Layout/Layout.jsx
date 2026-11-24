import { Suspense, lazy } from "react"
import { Outlet } from "react-router-dom"
import { Header } from "../Header/Header"
import { Footer } from "../Footer/Footer"
import { layoutStyles as s } from "./LayoutStyles"

const ChatWidget = lazy(() =>
  import("../../features/chat/components/ChatWidget/ChatWidget").then(
    (module) => ({ default: module.ChatWidget }),
  ),
)

export const Layout = () => (
  <div className={s.root}>
    <a href="#contenido" className={s.skipLink}>
      Saltar al contenido
    </a>
    <Header />
    <main id="contenido" className={s.main}>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
    <Suspense fallback={null}>
      <ChatWidget />
    </Suspense>
  </div>
)
