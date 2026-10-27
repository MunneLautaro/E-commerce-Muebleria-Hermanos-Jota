import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"
import { toast } from "react-toastify"
import { useAuth } from "../../hooks/useAuth"
import { useLoginForm } from "../../hooks/useLoginForm"
import { loginFormStyles as s } from "./LoginFormStyles"

export const LoginForm = () => {
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargandoGoogle, setCargandoGoogle] = useState(false)
  const { register, handleSubmit, errors, cargando } = useLoginForm()
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setCargandoGoogle(true)
      await loginWithGoogle(credentialResponse.credential)
      toast.success("¡Bienvenido/a de nuevo!")
      navigate("/")
    } catch (error) {
      toast.error(error.message || "Error al iniciar sesión con Google")
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
            text="continue_with"
            shape="rectangular"
            theme="outline"
            size="large"
            width="100%"
          />
        </div>

        <div className="w-full flex items-center my-1 gap-3">
          <div className="h-px flex-1 bg-linea" />
          <span className="text-xs uppercase tracking-cta text-ink-soft font-medium">
            o con tu correo
          </span>
          <div className="h-px flex-1 bg-linea" />
        </div>
      </div>

      <div className={s.campo}>
        <label className={s.etiqueta} htmlFor="login-email">
          Correo electrónico
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="ejemplo@correo.com"
          {...register("email")}
          className={s.control(Boolean(errors.email))}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "error-login-email" : undefined}
          disabled={estaBloqueado}
        />
        {errors.email ? (
          <span id="error-login-email" className={s.errorCampo}>
            {errors.email.message}
          </span>
        ) : null}
      </div>

      <div className={s.campo}>
        <label className={s.etiqueta} htmlFor="login-password">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={mostrarPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
            className={`${s.control(Boolean(errors.password))} pr-11`}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "error-login-password" : undefined
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
          <span id="error-login-password" className={s.errorCampo}>
            {errors.password.message}
          </span>
        ) : null}
      </div>

      <div className={s.acciones}>
        <button className={s.boton} type="submit" disabled={estaBloqueado}>
          {cargando ? "Iniciando sesión…" : "Ingresar a mi cuenta"}
        </button>

        <p className={s.pie}>
          ¿Aún no tenés una cuenta?
          <Link to="/register" className={s.enlace}>
            Registrate acá
          </Link>
        </p>
      </div>
    </form>
  )
}
