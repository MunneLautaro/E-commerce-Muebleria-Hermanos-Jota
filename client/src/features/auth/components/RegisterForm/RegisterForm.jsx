import { useState } from "react"
import { Link } from "react-router-dom"
import { useRegisterForm } from "../../hooks/useRegisterForm"
import { registerFormStyles as s } from "./RegisterFormStyles"

export const RegisterForm = () => {
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const { register, handleSubmit, errors, cargando } = useRegisterForm()

  return (
    <form className={s.form} onSubmit={handleSubmit} noValidate>
      {errors.root?.message ? (
        <div className={s.errorGeneral} role="alert">
          {errors.root.message}
        </div>
      ) : null}

      <div className={s.campo}>
        <label className={s.etiqueta} htmlFor="register-email">
          Correo electrónico
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="ejemplo@correo.com"
          {...register("email")}
          className={s.control(Boolean(errors.email))}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "error-register-email" : undefined}
          disabled={cargando}
        />
        {errors.email ? (
          <span id="error-register-email" className={s.errorCampo}>
            {errors.email.message}
          </span>
        ) : null}
      </div>

      <div className={s.fila}>
        <div className={s.campo}>
          <label className={s.etiqueta} htmlFor="register-phone">
            Teléfono
          </label>
          <input
            id="register-phone"
            type="tel"
            autoComplete="tel"
            placeholder="Ej. 11 4567 8900"
            {...register("phone")}
            className={s.control(Boolean(errors.phone))}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={
              errors.phone ? "error-register-phone" : undefined
            }
            disabled={cargando}
          />
          {errors.phone ? (
            <span id="error-register-phone" className={s.errorCampo}>
              {errors.phone.message}
            </span>
          ) : null}
        </div>

        <div className={s.campo}>
          <label className={s.etiqueta} htmlFor="register-address">
            Dirección
          </label>
          <input
            id="register-address"
            type="text"
            autoComplete="street-address"
            placeholder="Ej. Av. San Juan 2847, CABA"
            {...register("address")}
            className={s.control(Boolean(errors.address))}
            aria-invalid={Boolean(errors.address)}
            aria-describedby={
              errors.address ? "error-register-address" : undefined
            }
            disabled={cargando}
          />
          {errors.address ? (
            <span id="error-register-address" className={s.errorCampo}>
              {errors.address.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className={s.fila}>
        <div className={s.campo}>
          <label className={s.etiqueta} htmlFor="register-password">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={mostrarPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              {...register("password")}
              className={`${s.control(Boolean(errors.password))} pr-11`}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "error-register-password" : "ayuda-password"
              }
              disabled={cargando}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink focus:outline-none p-1"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              aria-label={
                mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"
              }
              tabIndex={-1}
            >
              {mostrarPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.password ? (
            <span id="error-register-password" className={s.errorCampo}>
              {errors.password.message}
            </span>
          ) : (
            <span id="ayuda-password" className={s.ayuda}>
              Al menos 8 caracteres
            </span>
          )}
        </div>

        <div className={s.campo}>
          <label className={s.etiqueta} htmlFor="register-confirm-password">
            Confirmar contraseña
          </label>
          <input
            id="register-confirm-password"
            type={mostrarPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repetí la contraseña"
            {...register("confirmPassword")}
            className={s.control(Boolean(errors.confirmPassword))}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword
                ? "error-register-confirm-password"
                : undefined
            }
            disabled={cargando}
          />
          {errors.confirmPassword ? (
            <span id="error-register-confirm-password" className={s.errorCampo}>
              {errors.confirmPassword.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className={s.acciones}>
        <button className={s.boton} type="submit" disabled={cargando}>
          {cargando ? "Creando cuenta…" : "Registrarme"}
        </button>

        <p className={s.pie}>
          ¿Ya tenés una cuenta?
          <Link to="/login" className={s.enlace}>
            Iniciá sesión aquí
          </Link>
        </p>
      </div>
    </form>
  )
}
