import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { GoogleLogin } from "@react-oauth/google"
import { toast } from "react-toastify"
import { useAuth } from "../../hooks/useAuth"
import { useRegisterForm } from "../../hooks/useRegisterForm"
import { registerFormStyles as s } from "./RegisterFormStyles"

export const RegisterForm = () => {
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargandoGoogle, setCargandoGoogle] = useState(false)
  const { register, handleSubmit, errors, cargando } = useRegisterForm()
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setCargandoGoogle(true)
      await loginWithGoogle(credentialResponse.credential)
      toast.success("¡Cuenta lista! Bienvenido/a a Hermanos Jota.")
      navigate("/")
    } catch (error) {
      toast.error(error.message || "Error al registrarse con Google")
    } finally {
      setCargandoGoogle(false)
    }
  }

  const handleGoogleError = () => {
    toast.error(
      "No se pudo conectar con Google. Por favor, intentá nuevamente.",
    )
  }

  const estaBloqueado = cargando || cargandoGoogle

  return (
    <form className={s.form} onSubmit={handleSubmit} noValidate>
      {errors.root?.message ? (
        <div className={s.errorGeneral} role="alert">
          {errors.root.message}
        </div>
      ) : null}

      <div className="flex flex-col items-center justify-center gap-3">
        <div className="w-full flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            text="signup_with"
            shape="rectangular"
            theme="outline"
            size="large"
            width="100%"
          />
        </div>

        <div className="w-full flex items-center my-1 gap-3">
          <div className="h-px flex-1 bg-linea" />
          <span className="text-xs uppercase tracking-cta text-ink-soft font-medium">
            o completá tus datos
          </span>
          <div className="h-px flex-1 bg-linea" />
        </div>
      </div>

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
          disabled={estaBloqueado}
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
            aria-describedby={errors.phone ? "error-register-phone" : undefined}
            disabled={estaBloqueado}
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
            disabled={estaBloqueado}
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
              disabled={estaBloqueado}
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
                <EyeOff className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Eye className="w-5 h-5" aria-hidden="true" />
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
            disabled={estaBloqueado}
          />
          {errors.confirmPassword ? (
            <span id="error-register-confirm-password" className={s.errorCampo}>
              {errors.confirmPassword.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className={s.acciones}>
        <button className={s.boton} type="submit" disabled={estaBloqueado}>
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
