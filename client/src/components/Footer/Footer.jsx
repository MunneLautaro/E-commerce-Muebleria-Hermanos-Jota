import { Link } from "react-router-dom"
import { footerStyles as s } from "./FooterStyles"
import logo from "../../assets/logo.svg"

export const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className={s.root}>
      <div className={s.inner}>
        <div className={s.grid}>
          <div className={s.brandBlock}>
            <div className={s.brand}>
              <span className={s.logoMark} aria-hidden="true">
                <img src={logo} alt="Hermanos Jota" className={s.logo} />
              </span>
              <span className={s.brandName}>Hermanos Jota</span>
            </div>
            <p className={s.tagline}>
              Muebles que no solo sirven una función, sino que alimentan el
              alma.
            </p>
          </div>

          <div>
            <h3 className={s.columnTitle}>Navegación</h3>
            <ul className={s.list}>
              <li>
                <Link to="/" className={s.link}>
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/productos" className={s.link}>
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/login" className={s.link}>
                  Ingresar
                </Link>
              </li>
              <li>
                <Link to="/register" className={s.link}>
                  Registrarse
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={s.columnTitle}>Showroom y taller</h3>
            <address className={`${s.list} not-italic`}>
              <span className={s.strong}>Casa Taller</span>
              <span>Av. San Juan 2847, San Cristóbal</span>
              <span>C1232AAB, Buenos Aires</span>
              <span>Lun a Vie: 10:00 a 19:00</span>
              <span>Sábados: 10:00 a 14:00</span>
            </address>
          </div>

          <div>
            <h3 className={s.columnTitle}>Contacto</h3>
            <ul className={s.list}>
              <li>
                <a href="mailto:info@hermanosjota.com.ar" className={s.link}>
                  info@hermanosjota.com.ar
                </a>
              </li>
              <li>
                <a href="mailto:ventas@hermanosjota.com.ar" className={s.link}>
                  ventas@hermanosjota.com.ar
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/541145678900"
                  target="_blank"
                  rel="noreferrer"
                  className={s.link}
                >
                  WhatsApp +54 11 4567-8900
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/hermanosjota_ba"
                  target="_blank"
                  rel="noreferrer"
                  className={s.link}
                >
                  @hermanosjota_ba
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className={s.sustain}>
          Trabajamos con madera certificada FSC de bosques argentinos y acabados
          naturales de bajo impacto.
        </p>

        <div className={s.bottom}>
          <span>© {year} Hermanos Jota. Todos los derechos reservados.</span>
          <span>Hecho a mano en Buenos Aires</span>
        </div>
      </div>
    </footer>
  )
}
