import { Link } from "react-router-dom"
import { notFoundStyles as s } from "./NotFoundPageStyles"

export default function NotFoundPage({
  title = "Página no encontrada",
  description = "El enlace que seguiste no existe o fue movido. Te invitamos a volver al inicio o recorrer nuestra colección.",
}) {
  return (
    <section className={s.section} aria-labelledby="not-found-title">
      <p className={s.code} aria-hidden="true">
        404
      </p>
      <p className={s.eyebrow}>Error 404</p>
      <h1 id="not-found-title" className={s.title}>
        {title}
      </h1>
      <p className={s.description}>{description}</p>
      <div className={s.actions}>
        <Link to="/" className={s.primaryButton}>
          Volver al inicio
        </Link>
        <Link to="/productos" className={s.secondaryButton}>
          Ver colección
        </Link>
      </div>
    </section>
  )
}
