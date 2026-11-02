import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from "./useAuth"
import { loginSchema } from "../schemas/auth.schema"

export const useLoginForm = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
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
      navigate("/")
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
