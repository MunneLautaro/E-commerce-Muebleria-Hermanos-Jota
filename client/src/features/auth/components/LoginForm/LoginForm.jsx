import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
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
              <EyeOff className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Eye className="w-5 h-5" aria-hidden="true" />
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
