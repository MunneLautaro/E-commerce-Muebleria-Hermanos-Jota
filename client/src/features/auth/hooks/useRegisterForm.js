import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from "./useAuth"
import { registerSchema } from "../schemas/auth.schema"
import { getRedirectState } from "../utils/redirect"

export const useRegisterForm = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  })

  const onSubmit = async (data) => {
    const email = data.email.trim().toLowerCase()

    try {
      await registerUser({
        email,
        password: data.password,
        phone: data.phone.trim(),
        address: data.address.trim(),
      })

      toast.success("¡Cuenta creada! Ingresá con tu email y contraseña.")
      void navigate("/login", {
        replace: true,
        state: { ...getRedirectState(location.state), email },
      })
    } catch (error) {
      const mensaje = error.message || "Error al crear la cuenta."
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
