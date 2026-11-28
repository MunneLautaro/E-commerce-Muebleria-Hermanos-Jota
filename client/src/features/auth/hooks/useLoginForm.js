import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from "./useAuth"
import { loginSchema } from "../schemas/auth.schema"
import { getRedirectPath } from "../utils/redirect"

export const useLoginForm = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const emailPrecargado = location.state?.email || ""

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: emailPrecargado,
      password: "",
    },
    mode: "onBlur",
  })

  const onSubmit = async (data) => {
    try {
      await login({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      })

      toast.success("¡Bienvenido/a de nuevo!")
      void navigate(getRedirectPath(location.state), { replace: true })
    } catch (error) {
      const mensaje = error.message || "Error al iniciar sesión."
      setError("root", { type: "server", message: mensaje })
      toast.error(mensaje)
    }
  }

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    cargando: isSubmitting,
  }
}
