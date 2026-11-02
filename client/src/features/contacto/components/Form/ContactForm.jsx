import { motivosConsulta, useContacto } from "../../hooks/useContacto"
import { contactFormStyles as s } from "./ContactFormStyles"

export const ContactForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    enviando,
    exito,
    limites,
    reiniciar,
    enviar,
  } = useContacto()
  const mensaje = watch("mensaje", "")

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

  const errorMessage = (field) =>
    errors[field] ? (
      <span className={s.errorCampo}>{errors[field].message}</span>
    ) : null

  return (
    <form className={s.form} onSubmit={handleSubmit(enviar)} noValidate>
      <div className={s.fila}>
        <div className={s.campo}>
          <label className={s.etiqueta} htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            {...register("nombre")}
            type="text"
            autoComplete="name"
            maxLength={limites.nombreMax}
            className={s.control(Boolean(errors.nombre))}
            aria-invalid={Boolean(errors.nombre)}
          />
          {errorMessage("nombre")}
        </div>
        <div className={s.campo}>
          <label className={s.etiqueta} htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            {...register("email")}
            type="email"
            autoComplete="email"
            maxLength={limites.emailMax}
            className={s.control(Boolean(errors.email))}
            aria-invalid={Boolean(errors.email)}
          />
          {errorMessage("email")}
        </div>
      </div>

      <div className={s.fila}>
        <div className={s.campo}>
          <label className={s.etiqueta} htmlFor="telefono">
            Teléfono <span className={s.opcional}>(opcional)</span>
          </label>
          <input
            id="telefono"
            {...register("telefono")}
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            maxLength={limites.telefonoMax}
            className={s.control(Boolean(errors.telefono))}
            aria-invalid={Boolean(errors.telefono)}
          />
          {errorMessage("telefono")}
        </div>
        <div className={s.campo}>
          <label className={s.etiqueta} htmlFor="motivo">Motivo</label>
          <select
            id="motivo"
            {...register("motivo")}
            className={s.control(Boolean(errors.motivo))}
            aria-invalid={Boolean(errors.motivo)}
          >
            <option value="">Elegí una opción</option>
            {motivosConsulta.map((motivo) => (
              <option key={motivo.valor} value={motivo.valor}>
                {motivo.etiqueta}
              </option>
            ))}
          </select>
          {errorMessage("motivo")}
        </div>
      </div>

      <div className={s.campo}>
        <label className={s.etiqueta} htmlFor="mensaje">Mensaje</label>
        <textarea
          id="mensaje"
          {...register("mensaje")}
          maxLength={limites.mensajeMax}
          className={s.textarea(Boolean(errors.mensaje))}
          placeholder="Contanos qué pieza te interesa o en qué podemos ayudarte."
          aria-invalid={Boolean(errors.mensaje)}
        />
        {errors.mensaje ? (
          errorMessage("mensaje")
        ) : (
          <span className={s.ayuda}>
            {mensaje.trim().length}/{limites.mensajeMax} caracteres
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
