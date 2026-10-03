import { motivosConsulta, useContacto } from "../../hooks/useContacto"
import { contactFormStyles as s } from "./ContactFormStyles"

export const ContactForm = () => {
  const {
    valores,
    errores,
    enviando,
    exito,
    limites,
    cambiarCampo,
    validarCampo,
    enviar,
    reiniciar,
  } = useContacto()

  if (exito) {
    return (
      <div className={s.alertaExito} role="status">
        <p className={s.tituloExito}>Consulta enviada</p>
        <p className={s.textoExito}>
          Recibimos tu mensaje. Te vamos a responder con calma y con datos
          concretos, a la brevedad.
        </p>
        <button className={s.botonSecundario} type="button" onClick={reiniciar}>
          Enviar otra consulta
        </button>
      </div>
    )
  }

  return (
    <form className={s.form} onSubmit={enviar} noValidate>
      <div className={s.fila}>
        <div className={s.campo}>
          <label className={s.etiqueta} htmlFor="nombre">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            autoComplete="name"
            maxLength={limites.nombreMax}
            value={valores.nombre}
            onChange={cambiarCampo}
            onBlur={validarCampo}
            className={s.control(Boolean(errores.nombre))}
            aria-invalid={Boolean(errores.nombre)}
            aria-describedby={errores.nombre ? "error-nombre" : undefined}
          />
          {errores.nombre ? (
            <span id="error-nombre" className={s.errorCampo}>
              {errores.nombre}
            </span>
          ) : null}
        </div>

        <div className={s.campo}>
          <label className={s.etiqueta} htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={valores.email}
            onChange={cambiarCampo}
            onBlur={validarCampo}
            className={s.control(Boolean(errores.email))}
            aria-invalid={Boolean(errores.email)}
            aria-describedby={errores.email ? "error-email" : undefined}
          />
          {errores.email ? (
            <span id="error-email" className={s.errorCampo}>
              {errores.email}
            </span>
          ) : null}
        </div>
      </div>

      <div className={s.fila}>
        <div className={s.campo}>
          <label className={s.etiqueta} htmlFor="telefono">
            Teléfono
            <span className={s.opcional}>(opcional)</span>
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            maxLength={limites.telefonoMax}
            value={valores.telefono}
            onChange={cambiarCampo}
            onBlur={validarCampo}
            className={s.control(Boolean(errores.telefono))}
            aria-invalid={Boolean(errores.telefono)}
            aria-describedby={errores.telefono ? "error-telefono" : undefined}
          />
          {errores.telefono ? (
            <span id="error-telefono" className={s.errorCampo}>
              {errores.telefono}
            </span>
          ) : null}
        </div>

        <div className={s.campo}>
          <label className={s.etiqueta} htmlFor="motivo">
            Motivo
          </label>
          <select
            id="motivo"
            name="motivo"
            value={valores.motivo}
            onChange={cambiarCampo}
            onBlur={validarCampo}
            className={s.control(Boolean(errores.motivo))}
            aria-invalid={Boolean(errores.motivo)}
            aria-describedby={errores.motivo ? "error-motivo" : undefined}
          >
            <option value="">Elegí una opción</option>
            {motivosConsulta.map((motivo) => (
              <option key={motivo.valor} value={motivo.valor}>
                {motivo.etiqueta}
              </option>
            ))}
          </select>
          {errores.motivo ? (
            <span id="error-motivo" className={s.errorCampo}>
              {errores.motivo}
            </span>
          ) : null}
        </div>
      </div>

      <div className={s.campo}>
        <label className={s.etiqueta} htmlFor="mensaje">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          value={valores.mensaje}
          onChange={cambiarCampo}
          onBlur={validarCampo}
          maxLength={limites.mensajeMax}
          className={s.textarea(Boolean(errores.mensaje))}
          placeholder="Contanos qué pieza te interesa o en qué podemos ayudarte."
          aria-invalid={Boolean(errores.mensaje)}
          aria-describedby={errores.mensaje ? "error-mensaje" : "ayuda-mensaje"}
        />
        {errores.mensaje ? (
          <span id="error-mensaje" className={s.errorCampo}>
            {errores.mensaje}
          </span>
        ) : (
          <span id="ayuda-mensaje" className={s.ayuda}>
            {valores.mensaje.trim().length}/{limites.mensajeMax} caracteres
          </span>
        )}
      </div>

      <div className={s.acciones}>
        <button className={s.boton} type="submit" disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar consulta"}
        </button>
      </div>
    </form>
  )
}
