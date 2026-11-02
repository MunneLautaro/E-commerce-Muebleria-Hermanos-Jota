import { Navigate } from "react-router-dom"
import { RegisterForm, useAuth } from "../../features/auth"
import { registerPageStyles as s } from "./RegisterPageStyles"

export default function RegisterPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className={s.container}>
      <header className={s.header}>
        <p className={s.eyebrow}>Crear nueva cuenta</p>
        <h1 className={s.title}>Registrate en Hermanos Jota</h1>
        <p className={s.description}>
          Formá parte de nuestra comunidad. Registrá tus datos para coordinar
          entregas con precisión, consultar tus compras y recibir atención
          directa de nuestro taller.
        </p>
      </header>

      <section
        className={s.card}
        aria-label="Formulario de registro de usuario"
      >
        <div className={s.formWrapper}>
          <div className={s.formHeader}>
            <h2 className={s.formTitle}>Completá tus datos</h2>
            <p className={s.formSubtitle}>
              Todos los campos son necesarios para poder gestionar tus pedidos.
            </p>
          </div>
          <RegisterForm />
        </div>

        <aside className={s.aside}>
          <div className={s.asideContent}>
            <div>
              <p className={s.asideEyebrow}>Comunidad & Oficio</p>
              <h2 className={s.asideTitle}>¿Por qué registrarte?</h2>
            </div>

            <ul className={s.asideList}>
              <li className={s.asideItem}>
                <span className={s.asideBullet} aria-hidden="true" />
                <span>Gestión ágil de envíos con tu dirección predeterminada.</span>
              </li>
              <li className={s.asideItem}>
                <span className={s.asideBullet} aria-hidden="true" />
                <span>Contacto directo por WhatsApp o teléfono con nuestros ebanistas.</span>
              </li>
              <li className={s.asideItem}>
                <span className={s.asideBullet} aria-hidden="true" />
                <span>Garantía artesanal y cuidado de por vida para tus muebles.</span>
              </li>
            </ul>
          </div>

          <p className={s.quoteBox}>
            "Cuidamos tus datos con la misma dedicación y respeto con la que
            tallamos cada veta de madera en nuestro taller."
          </p>
        </aside>
      </section>
    </div>
  )
}

