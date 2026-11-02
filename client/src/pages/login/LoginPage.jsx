import { Navigate } from "react-router-dom"
import { LoginForm, useAuth } from "../../features/auth"
import { loginPageStyles as s } from "./LoginPageStyles"

export default function LoginPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className={s.container}>
      <header className={s.header}>
        <p className={s.eyebrow}>Acceso a clientes</p>
        <h1 className={s.title}>Ingresá a tu cuenta</h1>
        <p className={s.description}>
          Accedé para revisar el estado de tus compras, tus datos de entrega y
          disfrutar de una atención personalizada en cada consulta.
        </p>
      </header>

      <section
        className={s.card}
        aria-label="Formulario de inicio de sesión"
      >
        <div className={s.formWrapper}>
          <div className={s.formHeader}>
            <h2 className={s.formTitle}>Identificate</h2>
            <p className={s.formSubtitle}>
              Ingresá tu correo y tu contraseña habitual.
            </p>
          </div>
          <LoginForm />
        </div>

        <aside className={s.aside}>
          <div className={s.asideContent}>
            <div>
              <p className={s.asideEyebrow}>Beneficios Hermanos Jota</p>
              <h2 className={s.asideTitle}>Tu espacio artesanal</h2>
            </div>

            <ul className={s.asideList}>
              <li className={s.asideItem}>
                <span className={s.asideBullet} aria-hidden="true" />
                <span>Seguimiento directo del estado de tus pedidos.</span>
              </li>
              <li className={s.asideItem}>
                <span className={s.asideBullet} aria-hidden="true" />
                <span>Historial de piezas adquiridas y cotizaciones.</span>
              </li>
              <li className={s.asideItem}>
                <span className={s.asideBullet} aria-hidden="true" />
                <span>Coordinación ágil para entregas en taller o a domicilio.</span>
              </li>
            </ul>
          </div>

          <p className={s.quoteBox}>
            "Diseñamos cada mueble para acompañarte con calidez, nobleza y
            funcionalidad durante toda la vida."
          </p>
        </aside>
      </section>
    </div>
  )
}

